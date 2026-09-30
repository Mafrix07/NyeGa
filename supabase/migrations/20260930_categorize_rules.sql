-- ====================================================================
-- MIGRATION NYEGA : RÈGLES DE CATÉGORISATION & DEVISE FCFA
-- Cible : Étudiants togolais
-- ====================================================================

-- 1. TABLE DES RÈGLES UTILISATEUR (Apprentissage par correction)
CREATE TABLE IF NOT EXISTS public.category_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    category_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_keyword UNIQUE (user_id, keyword)
);

COMMENT ON TABLE public.category_rules IS 'Mémoire utilisateur : correspondance mot-clé -> catégorie après correction manuelle';

-- 2. ACTIVATION DU ROW LEVEL SECURITY (RLS)
ALTER TABLE public.category_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les étudiants lisent leurs propres règles"
    ON public.category_rules FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les étudiants ajoutent leurs propres règles"
    ON public.category_rules FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les étudiants modifient leurs propres règles"
    ON public.category_rules FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Les étudiants suppriment leurs propres règles"
    ON public.category_rules FOR DELETE
    USING (auth.uid() = user_id);

-- Index pour recherche ultra-rapide par mot-clé et utilisateur
CREATE INDEX IF NOT EXISTS idx_category_rules_user_keyword
    ON public.category_rules (user_id, keyword);

-- 3. MISE À JOUR DE LA DEVISE PAR DÉFAUT DANS PROFILES & BUDGETS (FCFA)
ALTER TABLE public.profiles ALTER COLUMN currency SET DEFAULT 'FCFA';

-- 4. INSERTION / MISE À JOUR DES 7 CATÉGORIES TOGOLAISES OFFICIELLES
-- Supprime ou met à jour les catégories par défaut précédentes
DELETE FROM public.categories WHERE user_id IS NULL;

INSERT INTO public.categories (name, icon, color, is_default, user_id) VALUES
    ('Alimentation', 'fa-cutlery', '#10B982', true, NULL),
    ('Transport', 'fa-motorcycle', '#FBB418', true, NULL),
    ('Soins et beauté', 'fa-heart', '#EC4899', true, NULL),
    ('Connexion internet', 'fa-wifi', '#2563EB', true, NULL),
    ('Crédit d''appel', 'fa-phone', '#06B6D4', true, NULL),
    ('Plaisirs', 'fa-glass', '#8B5CF6', true, NULL),
    ('Autres', 'fa-tag', '#64748B', true, NULL);

-- 5. MISE À JOUR DU TRIGGER UTILISATEUR (Profil avec devise FCFA, budget défini par l'étudiant à l'inscription)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Profil avec devise FCFA
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
