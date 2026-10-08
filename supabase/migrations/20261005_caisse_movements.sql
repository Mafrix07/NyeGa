-- ====================================================================
-- MIGRATION NYEGA : TABLE DE LA CAISSE (caisse_movements)
-- Cible : Étudiants togolais (Devise FCFA)
-- ====================================================================

-- 1. TABLE CAISSE_MOVEMENTS
CREATE TABLE IF NOT EXISTS public.caisse_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL CHECK (amount <> 0),
    type TEXT NOT NULL CHECK (type IN ('leftover', 'withdrawal', 'adjustment')),
    budget_id UUID NULL REFERENCES public.budgets(id) ON DELETE SET NULL,
    note TEXT NULL CHECK (char_length(note) <= 200),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.caisse_movements IS 'Mouvements de caisse d''épargne des étudiants (restes de budget, retraits, ajustements)';

-- 2. INDEX
-- Index unique partiel : un budget ne peut verser son reste qu'UNE seule fois
CREATE UNIQUE INDEX IF NOT EXISTS idx_caisse_movements_budget_leftover
    ON public.caisse_movements (budget_id)
    WHERE type = 'leftover';

-- Index par utilisateur pour accélération des requêtes et calculs de solde
CREATE INDEX IF NOT EXISTS idx_caisse_movements_user_id
    ON public.caisse_movements (user_id, created_at DESC);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.caisse_movements ENABLE ROW LEVEL SECURITY;

-- SELECT limité à auth.uid() = user_id
CREATE POLICY "Les étudiants lisent leurs propres mouvements de caisse"
    ON public.caisse_movements FOR SELECT
    USING (auth.uid() = user_id);

-- AUCUNE politique INSERT, UPDATE ni DELETE pour le client.
-- Les écritures passent exclusivement par les fonctions SECURITY DEFINER ou service_role.
REVOKE INSERT, UPDATE, DELETE ON public.caisse_movements FROM anon, authenticated;
GRANT SELECT ON public.caisse_movements TO authenticated;
GRANT ALL ON public.caisse_movements TO service_role;

-- 4. FONCTION caisse_balance()
-- Somme des mouvements de auth.uid(). Le solde ne doit jamais pouvoir être négatif.
CREATE OR REPLACE FUNCTION public.caisse_balance()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_balance BIGINT;
BEGIN
    SELECT COALESCE(SUM(amount), 0)::BIGINT
    INTO v_balance
    FROM public.caisse_movements
    WHERE user_id = auth.uid();

    IF v_balance < 0 THEN
        RETURN 0::BIGINT;
    END IF;

    RETURN v_balance;
END;
$$;

COMMENT ON FUNCTION public.caisse_balance() IS 'Calcule le solde courant de la caisse pour l''étudiant connecté (>= 0)';

REVOKE EXECUTE ON FUNCTION public.caisse_balance() FROM anon;
GRANT EXECUTE ON FUNCTION public.caisse_balance() TO authenticated;

-- 5. MISE À JOUR DE LA FONCTION DE SUPPRESSION DE COMPTE (Loi 2019-014)
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
BEGIN
    DELETE FROM public.caisse_movements WHERE user_id = auth.uid();
    DELETE FROM public.expenses WHERE user_id = auth.uid();
    DELETE FROM public.budgets WHERE user_id = auth.uid();
    DELETE FROM public.category_rules WHERE user_id = auth.uid();
    DELETE FROM public.rate_limits WHERE user_id = auth.uid();
    DELETE FROM public.profiles WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
