/**
 * NYEGA - Supabase Edge Function : categorize-expense
 *
 * Catégorisation intelligente de dépense par IA (Gemini Flash-Lite)
 * avec vérification JWT, limitation de débit (30 req/h/user),
 * validation stricte et protection de la vie privée (seule la description est transmise).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { GeminiFlashLiteProvider, ALLOWED_CATEGORIES } from './ai-provider.ts';

// Headers CORS standards
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

/**
 * Limitation de débit sécurisée gérée côté serveur via SUPABASE_SERVICE_ROLE_KEY.
 * RLS activée sur rate_limits : aucun accès en écriture direct côté client.
 * Quota : 30 requêtes par heure glissante par étudiant, incrémenté de façon atomique via SQL.
 */
async function checkRateLimit(adminSupabase: any, userId: string): Promise<boolean> {
  if (!adminSupabase || userId === 'anonymous') return false;

  try {
    // 1. Incrémentation atomique avec row-lock via fonction SQL
    const { data, error: rpcError } = await adminSupabase.rpc('check_and_increment_rate_limit', {
      p_user_id: userId,
      p_max_requests: 30
    });

    if (!rpcError && data && typeof data === 'object') {
      return Boolean(data.limited);
    }

    if (rpcError) {
      console.warn('RPC check_and_increment_rate_limit indisponible, passage direct table :', rpcError.message);
    }

    // 2. Fallback de secours direct sur la table via client service_role
    const now = new Date();
    const windowMs = 60 * 60 * 1000;
    const maxRequests = 30;

    const { data: record, error: selectError } = await adminSupabase
      .from('rate_limits')
      .select('request_count, reset_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError) {
      console.warn('Erreur lecture rate_limits (service_role):', selectError.message);
      return false;
    }

    if (!record) {
      const resetAt = new Date(now.getTime() + windowMs).toISOString();
      await adminSupabase.from('rate_limits').insert({
        user_id: userId,
        request_count: 1,
        reset_at: resetAt
      });
      return false;
    }

    const resetDate = new Date(record.reset_at);
    if (now > resetDate) {
      const resetAt = new Date(now.getTime() + windowMs).toISOString();
      await adminSupabase.from('rate_limits').update({
        request_count: 1,
        reset_at: resetAt,
        updated_at: now.toISOString()
      }).eq('user_id', userId);
      return false;
    }

    if (record.request_count >= maxRequests) {
      return true;
    }

    await adminSupabase.from('rate_limits').update({
      request_count: record.request_count + 1,
      updated_at: now.toISOString()
    }).eq('user_id', userId);

    return false;
  } catch (err) {
    console.error('Erreur contrôle rate limit (service_role):', err);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  // 1. Gestion des requêtes OPTIONS (CORS Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // 2. Vérification de l'authentification (JWT Supabase obligatoire)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentification requise (JWT manquant)' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    let userId = 'anonymous';
    if (supabaseUrl && supabaseAnonKey) {
      const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      const { data: { user }, error: authError } = await userSupabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Session invalide ou expirée' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      userId = user.id;
    }

    // 3. Client Admin sécurisé pour le rate limiting (SUPABASE_SERVICE_ROLE_KEY côté serveur uniquement)
    const adminSupabase = (supabaseUrl && serviceRoleKey)
      ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
      : null;

    // Contrôle du quota de requêtes utilisateur (30/h) via fonction SQL atomique
    const rateLimited = await checkRateLimit(adminSupabase, userId);
    if (rateLimited) {
      console.warn(`Quota utilisateur atteint pour ${userId} (30 req/h). Bascule silencieuse vers Autres.`);
      return new Response(JSON.stringify({
        category: 'Autres',
        confidence: 0.0,
        source: 'rate_limit_fallback'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Extraction & Assainissement des données (Protection stricte de la vie privée)
    // Seule la description est traitée : ni montant, ni nom, ni email ne sont acceptés
    const body = await req.json().catch(() => ({}));
    let rawDescription = typeof body.description === 'string' ? body.description.trim() : '';

    if (!rawDescription) {
      return new Response(JSON.stringify({
        category: 'Autres',
        confidence: 0.0,
        source: 'empty'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Limiter la description à 100 caractères maximum
    const cleanDescription = rawDescription.slice(0, 100).trim();

    // 5. Appel au fournisseur d'IA avec timeout strict de 4 secondes
    const aiProvider = new GeminiFlashLiteProvider();
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 4000);

    let result;
    try {
      result = await aiProvider.categorize(cleanDescription, abortController.signal);
    } finally {
      clearTimeout(timeoutId);
    }

    // 6. Validation finale côté serveur
    if (!ALLOWED_CATEGORIES.includes(result.category as any)) {
      result.category = 'Autres';
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Erreur inattendue dans la fonction de catégorisation:', error);
    // En cas d'erreur serveur, on ne bloque JAMAIS l'utilisateur : retour "Autres"
    return new Response(JSON.stringify({
      category: 'Autres',
      confidence: 0.0,
      source: 'server_error_fallback'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
