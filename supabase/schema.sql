-- ====================================================================
-- NYEGA - Schéma SQL Supabase & Politiques Row Level Security (RLS)
-- Application de gestion de budget pour étudiants togolais (Devise : FCFA)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE DES PROFILS UTILISATEURS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    currency TEXT DEFAULT 'FCFA',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Profils des étudiants inscrits sur Nyega (Devise FCFA)';

-- 3. TABLE DES 7 CATÉGORIES OFFICIELLES TOGOLAISES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = catégorie système globale
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'fa-tag',
    color TEXT NOT NULL DEFAULT '#002D7A',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.categories IS 'Catégories de dépenses (système et utilisateur)';

-- 4. TABLE DE MÉMOIRE UTILISATEUR : category_rules (Apprentissage par correction)
CREATE TABLE IF NOT EXISTS public.category_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    category_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_keyword UNIQUE (user_id, keyword)
);

COMMENT ON TABLE public.category_rules IS 'Règles de catégorisation apprises des corrections de l''utilisateur';

-- 5. TABLE DES BUDGETS (Devise FCFA, ex. 50 000 FCFA/mois)
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    monthly_amount NUMERIC(12, 0) NOT NULL DEFAULT 50000 CHECK (monthly_amount >= 0),
    period_start DATE NOT NULL DEFAULT CURRENT_DATE,
    period_end DATE NOT NULL,
    alert_threshold_warning INT DEFAULT 75, -- 75% du budget consommé
    alert_threshold_danger INT DEFAULT 90,  -- 90% du budget consommé
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.budgets IS 'Budgets mensuels en FCFA des étudiants';

-- 6. TABLE DES DÉPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC(12, 0) NOT NULL CHECK (amount > 0),
    description TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'Carte',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.expenses IS 'Dépenses enregistrées par les étudiants (en FCFA)';

-- 7. TABLE DE RATE LIMITING (30 requêtes / heure / étudiant pour Edge Function)
CREATE TABLE IF NOT EXISTS public.rate_limits (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    request_count INT NOT NULL DEFAULT 1 CHECK (request_count >= 0),
    reset_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.rate_limits IS 'Compteur de requêtes IA (30 req/h) par étudiant pour categorize-expense';

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) - Isolation stricte par utilisateur
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Politiques Profiles
CREATE POLICY "Les utilisateurs voient leur propre profil"
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs mettent à jour leur propre profil"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Création de profil par l'utilisateur connecté"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Les utilisateurs suppriment leur propre profil"
    ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Politiques Categories
CREATE POLICY "Lecture des catégories système et utilisateur"
    ON public.categories FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Ajout de catégories personnalisées"
    ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Modification de ses propres catégories"
    ON public.categories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Suppression de ses propres catégories"
    ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Politiques Category Rules (Mémoire utilisateur)
CREATE POLICY "Les étudiants lisent leurs propres règles"
    ON public.category_rules FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les étudiants ajoutent leurs propres règles"
    ON public.category_rules FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les étudiants modifient leurs propres règles"
    ON public.category_rules FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Les étudiants suppriment leurs propres règles"
    ON public.category_rules FOR DELETE USING (auth.uid() = user_id);

-- Politiques Budgets
CREATE POLICY "Lecture de ses propres budgets"
    ON public.budgets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Création de ses budgets"
    ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mise à jour de ses budgets"
    ON public.budgets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Suppression de ses budgets"
    ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- Politiques Expenses
CREATE POLICY "Lecture de ses propres dépenses"
    ON public.expenses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Ajout de ses dépenses"
    ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Modification de ses dépenses"
    ON public.expenses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Suppression de ses dépenses"
    ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Politiques Rate Limits : RLS activée, AUCUN accès direct côté client (ni lecture ni écriture)
DROP POLICY IF EXISTS "Les étudiants créent leur propre rate limit" ON public.rate_limits;
DROP POLICY IF EXISTS "Les étudiants mettent à jour leur propre rate limit" ON public.rate_limits;
DROP POLICY IF EXISTS "Les étudiants suppriment leur rate limit" ON public.rate_limits;
DROP POLICY IF EXISTS "Les étudiants gèrent leur rate limit" ON public.rate_limits;
DROP POLICY IF EXISTS "Les étudiants lisent leur propre rate limit" ON public.rate_limits;

-- Révocation totale de tout droit direct pour anon et authenticated
REVOKE ALL ON public.rate_limits FROM anon, authenticated;
GRANT ALL ON public.rate_limits TO service_role;

-- Fonction SQL d'incrémentation atomique (exécutée par l'Edge Function via service_role ou security definer)
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
    SELECT * INTO v_record FROM public.rate_limits WHERE user_id = p_user_id FOR UPDATE;

    IF NOT FOUND THEN
        v_reset_at := v_now + p_window_interval;
        INSERT INTO public.rate_limits (user_id, request_count, reset_at, created_at, updated_at)
        VALUES (p_user_id, 1, v_reset_at, v_now, v_now);
        RETURN jsonb_build_object('limited', FALSE, 'count', 1, 'reset_at', v_reset_at);
    END IF;

    IF v_now > v_record.reset_at THEN
        v_reset_at := v_now + p_window_interval;
        UPDATE public.rate_limits
        SET request_count = 1, reset_at = v_reset_at, updated_at = v_now
        WHERE user_id = p_user_id;
        RETURN jsonb_build_object('limited', FALSE, 'count', 1, 'reset_at', v_reset_at);
    END IF;

    IF v_record.request_count >= p_max_requests THEN
        RETURN jsonb_build_object('limited', TRUE, 'count', v_record.request_count, 'reset_at', v_record.reset_at);
    END IF;

    v_count := v_record.request_count + 1;
    UPDATE public.rate_limits
    SET request_count = v_count, updated_at = v_now
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object('limited', FALSE, 'count', v_count, 'reset_at', v_record.reset_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
REVOKE EXECUTE ON FUNCTION public.check_and_increment_rate_limit(UUID, INT, INTERVAL) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(UUID, INT, INTERVAL) TO service_role;

-- Index pour category_rules
CREATE INDEX IF NOT EXISTS idx_category_rules_user_keyword
    ON public.category_rules (user_id, keyword);

-- Fonction de suppression complète et conforme du compte utilisateur (Loi 2019-014 - Droit à l'effacement)
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
BEGIN
    DELETE FROM public.expenses WHERE user_id = auth.uid();
    DELETE FROM public.budgets WHERE user_id = auth.uid();
    DELETE FROM public.category_rules WHERE user_id = auth.uid();
    DELETE FROM public.rate_limits WHERE user_id = auth.uid();
    DELETE FROM public.profiles WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- ====================================================================
-- TRIGGERS AUTOMATIQUES
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_budgets_updated
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_expenses_updated
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_rate_limits_updated
    BEFORE UPDATE ON public.rate_limits
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger à la création d'un utilisateur Auth Supabase :
-- Crée automatiquement le profil avec devise FCFA (le budget est défini par l'étudiant à l'inscription)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, currency)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'FCFA'
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ====================================================================
-- SEED DATA : LES 7 CATÉGORIES TOGOLAISES OFFICIELLES
-- ====================================================================
DELETE FROM public.categories WHERE user_id IS NULL;

INSERT INTO public.categories (name, icon, color, is_default, user_id) VALUES
    ('Alimentation', 'fa-cutlery', '#10B982', true, NULL),
    ('Transport', 'fa-motorcycle', '#FBB418', true, NULL),
    ('Soins et beauté', 'fa-heart', '#EC4899', true, NULL),
    ('Connexion internet', 'fa-wifi', '#2563EB', true, NULL),
    ('Crédit d''appel', 'fa-phone', '#06B6D4', true, NULL),
    ('Plaisirs', 'fa-glass', '#8B5CF6', true, NULL),
    ('Autres', 'fa-tag', '#64748B', true, NULL)
ON CONFLICT DO NOTHING;
