/**
 * NYEGA - Supabase Edge Function : categorize-expense
 *
 * Catégorisation intelligente de dépense par IA (Gemini Flash-Lite)
 * avec vérification JWT, limitation de débit (30 req/h/user),
 * validation stricte des entrées, CORS restreint et confidentialité totale (zéro PII dans les logs).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { GeminiFlashLiteProvider, ALLOWED_CATEGORIES } from './ai-provider.ts';

// Liste des origines autorisées (domaines de production, dev et déploiement)
const DEFAULT_ALLOWED_ORIGINS = [
  'https://nyega.tg',
  'https://www.nyega.tg',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

/**
 * Détermine les en-têtes CORS selon l'origine de la requête
 */
function getCorsHeaders(origin: string | null): Record<string, string> {
  const customAllowed = Deno.env.get('ALLOWED_ORIGIN');
  let isAllowed = false;

  if (origin) {
    if (customAllowed && (origin === customAllowed || customAllowed === '*')) {
      isAllowed = true;
    } else if (DEFAULT_ALLOWED_ORIGINS.includes(origin)) {
      isAllowed = true;
    } else if (origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app') || origin.endsWith('.pages.dev')) {
      // Déploiements preview / production Vercel & Netlify & Cloudflare
      isAllowed = true;
    }
  }

  const allowOrigin = isAllowed && origin ? origin : (customAllowed || DEFAULT_ALLOWED_ORIGINS[0]);

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
}

/**
 * Limitation de débit sécurisée gérée côté serveur via SUPABASE_SERVICE_ROLE_KEY.
 * RLS activée sur rate_limits : aucun accès en écriture direct côté client.
 * Quota : 30 requêtes par heure glissante par étudiant, incrémenté de façon atomique via SQL.
 * NOTE : Aucune donnée personnelle ni identifiant utilisateur n'est consigné dans les logs.
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
      console.warn('[RateLimit] Appel RPC indisponible, bascule sur la table.');
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
      console.warn('[RateLimit] Erreur lecture table rate_limits.');
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
  } catch (_err) {
    console.error('[RateLimit] Erreur inattendue lors du contrôle de quota.');
    return false;
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin');
  const cors = getCorsHeaders(origin);

  // 1. Gestion des requêtes OPTIONS (CORS Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  // Seule la méthode POST est autorisée
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }

  try {
    // 2. Vérification du Content-Type (Strictement application/json)
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Format de contenu non supporté' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // 3. Vérification de l'authentification (JWT Supabase obligatoire)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentification requise' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return new Response(JSON.stringify({ error: 'Authentification requise' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

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
          headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }
      userId = user.id;
    }

    // 4. Contrôle du quota utilisateur (30 req/h) - Zéro PII dans les logs
    const adminSupabase = (supabaseUrl && serviceRoleKey)
      ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
      : null;

    const rateLimited = await checkRateLimit(adminSupabase, userId);
    if (rateLimited) {
      console.warn('[RateLimit] Quota horaire atteint pour un utilisateur. Bascule silencieuse vers Autres.');
      return new Response(JSON.stringify({
        category: 'Autres',
        confidence: 0.0,
        source: 'rate_limit_fallback'
      }), {
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // 5. Validation stricte du corps de requête (Type, Structure, Longueur)
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Corps de requête JSON invalide' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return new Response(JSON.stringify({ error: 'Format de requête invalide' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    if (typeof body.description !== 'string') {
      return new Response(JSON.stringify({ error: 'Le champ description doit être une chaîne de caractères' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // Nettoyage des caractères de contrôle dangereux
    const sanitizedDescription = body.description
      .replace(/[\x00-\x1F\x7F]/g, ' ')
      .trim();

    if (!sanitizedDescription) {
      return new Response(JSON.stringify({
        category: 'Autres',
        confidence: 0.0,
        source: 'empty'
      }), {
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // Validation stricte de la longueur (1 à 100 caractères)
    if (sanitizedDescription.length > 100) {
      return new Response(JSON.stringify({ error: 'La description ne doit pas dépasser 100 caractères' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // 6. Appel au fournisseur d'IA avec timeout strict de 4 secondes
    // NOTE DE CONFIDENTIALITÉ : Aucune description ni PII n'est journalisée
    const aiProvider = new GeminiFlashLiteProvider();
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 4000);

    let result;
    try {
      result = await aiProvider.categorize(sanitizedDescription, abortController.signal);
    } finally {
      clearTimeout(timeoutId);
    }

    // 7. Validation finale de la catégorie de retour
    if (!ALLOWED_CATEGORIES.includes(result.category as any)) {
      result.category = 'Autres';
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    // Log technique sécurisé sans aucune donnée utilisateur
    console.error('[Erreur Catégorisation] Exception interne survenue.');
    // En cas d'erreur serveur, réponse générique sans crash de l'interface
    return new Response(JSON.stringify({
      category: 'Autres',
      confidence: 0.0,
      source: 'server_error_fallback'
    }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
});
