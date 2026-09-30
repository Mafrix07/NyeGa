-- ====================================================================
-- MIGRATION NYEGA : TABLE RATE_LIMITS POUR SUPABASE EDGE FUNCTION
-- Limitation de débit atomique (30 req/h) via SUPABASE_SERVICE_ROLE_KEY
-- RLS activée, AUCUN accès en écriture direct côté client
-- ====================================================================

-- 1. CRÉATION DE LA TABLE RATE_LIMITS
CREATE TABLE IF NOT EXISTS public.rate_limits (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    request_count INT NOT NULL DEFAULT 1 CHECK (request_count >= 0),
    reset_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.rate_limits IS 'Compteur de requêtes IA (30 req/h) par étudiant pour categorize-expense. RLS activée sans accès écriture client.';

-- 2. ACTIVATION DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 3. POLITIQUES RLS : Aucun accès INSERT / UPDATE / DELETE direct côté client
-- Supprimer d'anciennes politiques si elles existent
DROP POLICY IF EXISTS "Les étudiants créent leur propre rate limit" ON public.rate_limits;
DROP POLICY IF EXISTS "Les étudiants mettent à jour leur propre rate limit" ON public.rate_limits;
DROP POLICY IF EXISTS "Les étudiants suppriment leur rate limit" ON public.rate_limits;
DROP POLICY IF EXISTS "Les étudiants gèrent leur rate limit" ON public.rate_limits;

-- Seule la lecture de son propre statut peut être autorisée en RLS (facultatif)
CREATE POLICY "Les étudiants lisent leur propre rate limit"
    ON public.rate_limits FOR SELECT
    USING (auth.uid() = user_id);

-- Révoquer explicitement tout droit d'écriture direct sur la table pour anon et authenticated
REVOKE INSERT, UPDATE, DELETE ON public.rate_limits FROM anon, authenticated;

-- 4. FONCTION SQL D'INCRÉMENTATION ATOMIQUE AVEC ROW-LOCK
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
    p_user_id UUID,
    p_max_requests INT DEFAULT 30,
    p_window_interval INTERVAL DEFAULT INTERVAL '1 hour'
)
RETURNS JSONB AS $$
DECLARE
    v_record public.rate_limits%ROWTYPE;
    v_now TIMESTAMPTZ := TIMEZONE('utc'::text, NOW());
    v_reset_at TIMESTAMPTZ;
    v_count INT;
BEGIN
    -- Verrouillage exclusif de la ligne (concurrence atomique)
    SELECT * INTO v_record FROM public.rate_limits WHERE user_id = p_user_id FOR UPDATE;

    IF NOT FOUND THEN
        v_reset_at := v_now + p_window_interval;
        INSERT INTO public.rate_limits (user_id, request_count, reset_at, created_at, updated_at)
        VALUES (p_user_id, 1, v_reset_at, v_now, v_now);
        RETURN jsonb_build_object('limited', FALSE, 'count', 1, 'reset_at', v_reset_at);
    END IF;

    -- Si la fenêtre de temps est expirée : réinitialisation
    IF v_now > v_record.reset_at THEN
        v_reset_at := v_now + p_window_interval;
        UPDATE public.rate_limits
        SET request_count = 1,
            reset_at = v_reset_at,
            updated_at = v_now
        WHERE user_id = p_user_id;
        RETURN jsonb_build_object('limited', FALSE, 'count', 1, 'reset_at', v_reset_at);
    END IF;

    -- Si la limite maximale est atteinte
    IF v_record.request_count >= p_max_requests THEN
        RETURN jsonb_build_object('limited', TRUE, 'count', v_record.request_count, 'reset_at', v_record.reset_at);
    END IF;

    -- Incrémentation atomique du compteur
    v_count := v_record.request_count + 1;
    UPDATE public.rate_limits
    SET request_count = v_count,
        updated_at = v_now
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object('limited', FALSE, 'count', v_count, 'reset_at', v_record.reset_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
