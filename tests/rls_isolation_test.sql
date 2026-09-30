-- ====================================================================
-- NYEGA - SCRIPT DE TEST DE VALIDATION DE L'ISOLATION RLS (SQL)
-- Valide l'étanchéité stricte entre deux utilisateurs distincts :
-- Tables testées : profiles, budgets, category_rules, expenses
-- ====================================================================

BEGIN;

-- 1. IDENTIFIANTS DES DEUX ÉTUDIANTS DE TEST
DO $$
DECLARE
    v_user_a UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
    v_user_b UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
    v_count INT;
    v_updated INT;
BEGIN
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'DÉBUT DES TESTS DE SÉCURITÉ ROW LEVEL SECURITY (RLS)';
    RAISE NOTICE '=======================================================';

    -- A. Insertion des profils
    INSERT INTO public.profiles (id, email, full_name, currency)
    VALUES
        (v_user_a, 'etudiant.a@nyega.tg', 'Étudiant A (Lomé)', 'FCFA'),
        (v_user_b, 'etudiant.b@nyega.tg', 'Étudiant B (Kara)', 'FCFA')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

    -- B. Insertion des budgets
    INSERT INTO public.budgets (user_id, monthly_amount, period_start, period_end)
    VALUES
        (v_user_a, 45000, CURRENT_DATE, CURRENT_DATE + 30),
        (v_user_b, 65000, CURRENT_DATE, CURRENT_DATE + 30);

    -- C. Insertion des règles de catégorisation (mémoire)
    INSERT INTO public.category_rules (user_id, keyword, category_name)
    VALUES
        (v_user_a, 'ayimolou a', 'Alimentation'),
        (v_user_b, 'zem b', 'Transport');

    -- D. Insertion des dépenses
    INSERT INTO public.expenses (user_id, amount, description, expense_date)
    VALUES
        (v_user_a, 500, 'Zem pour campus Université de Lomé', CURRENT_DATE),
        (v_user_b, 1500, 'Cantine restaurant Kara', CURRENT_DATE);

    RAISE NOTICE '✅ Données initiales insérées pour Utilisateur A et Utilisateur B.';
END $$;

-----------------------------------------------------------------------
-- 2. SIMULATION UTILISATEUR A (auth.uid() = User A)
-----------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "a0000000-0000-0000-0000-000000000001", "role": "authenticated"}';

DO $$
DECLARE
    v_user_a UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
    v_user_b UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
    v_count INT;
    v_updated INT;
BEGIN
    RAISE NOTICE '-------------------------------------------------------';
    RAISE NOTICE 'TEST CONTEXTE : Utilisateur A';
    RAISE NOTICE '-------------------------------------------------------';

    -- Test 1.1 : SELECT profiles
    SELECT COUNT(*) INTO v_count FROM public.profiles WHERE id = v_user_b;
    IF v_count <> 0 THEN RAISE EXCEPTION 'FAIL RLS Profiles : Utilisateur A peut voir le profil de Utilisateur B !'; END IF;
    SELECT COUNT(*) INTO v_count FROM public.profiles WHERE id = v_user_a;
    IF v_count <> 1 THEN RAISE EXCEPTION 'FAIL RLS Profiles : Utilisateur A ne peut pas voir son propre profil !'; END IF;
    RAISE NOTICE '✅ [PASS] RLS public.profiles : A ne voit pas B';

    -- Test 1.2 : SELECT budgets
    SELECT COUNT(*) INTO v_count FROM public.budgets WHERE user_id = v_user_b;
    IF v_count <> 0 THEN RAISE EXCEPTION 'FAIL RLS Budgets : Utilisateur A peut voir le budget de Utilisateur B !'; END IF;
    SELECT COUNT(*) INTO v_count FROM public.budgets WHERE user_id = v_user_a;
    IF v_count <> 1 THEN RAISE EXCEPTION 'FAIL RLS Budgets : Utilisateur A ne voit pas son propre budget !'; END IF;
    RAISE NOTICE '✅ [PASS] RLS public.budgets : A ne voit pas B';

    -- Test 1.3 : SELECT category_rules
    SELECT COUNT(*) INTO v_count FROM public.category_rules WHERE user_id = v_user_b;
    IF v_count <> 0 THEN RAISE EXCEPTION 'FAIL RLS Category_rules : Utilisateur A peut voir les règles de Utilisateur B !'; END IF;
    SELECT COUNT(*) INTO v_count FROM public.category_rules WHERE user_id = v_user_a;
    IF v_count <> 1 THEN RAISE EXCEPTION 'FAIL RLS Category_rules : Utilisateur A ne voit pas sa propre règle !'; END IF;
    RAISE NOTICE '✅ [PASS] RLS public.category_rules : A ne voit pas B';

    -- Test 1.4 : SELECT expenses
    SELECT COUNT(*) INTO v_count FROM public.expenses WHERE user_id = v_user_b;
    IF v_count <> 0 THEN RAISE EXCEPTION 'FAIL RLS Expenses : Utilisateur A peut voir les dépenses de Utilisateur B !'; END IF;
    SELECT COUNT(*) INTO v_count FROM public.expenses WHERE user_id = v_user_a;
    IF v_count <> 1 THEN RAISE EXCEPTION 'FAIL RLS Expenses : Utilisateur A ne voit pas sa propre dépense !'; END IF;
    RAISE NOTICE '✅ [PASS] RLS public.expenses : A ne voit pas B';

    -- Test 1.5 : Tentative de modification pirate de la dépense de B par A
    UPDATE public.expenses SET amount = 99999 WHERE user_id = v_user_b;
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated <> 0 THEN RAISE EXCEPTION 'FAIL RLS Expenses : Utilisateur A a réussi à modifier la dépense de B !'; END IF;
    RAISE NOTICE '✅ [PASS] RLS public.expenses : A ne peut PAS modifier la dépense de B (0 lignes modifiées)';

    -- Test 1.6 : Tentative de suppression pirate du budget de B par A
    DELETE FROM public.budgets WHERE user_id = v_user_b;
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated <> 0 THEN RAISE EXCEPTION 'FAIL RLS Budgets : Utilisateur A a réussi à supprimer le budget de B !'; END IF;
    RAISE NOTICE '✅ [PASS] RLS public.budgets : A ne peut PAS supprimer le budget de B (0 lignes supprimées)';
END $$;

-----------------------------------------------------------------------
-- 3. SIMULATION UTILISATEUR B (auth.uid() = User B)
-----------------------------------------------------------------------
SET LOCAL "request.jwt.claims" = '{"sub": "b0000000-0000-0000-0000-000000000002", "role": "authenticated"}';

DO $$
DECLARE
    v_user_a UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
    v_user_b UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
    v_count INT;
    v_updated INT;
BEGIN
    RAISE NOTICE '-------------------------------------------------------';
    RAISE NOTICE 'TEST CONTEXTE : Utilisateur B (Réciprocité)';
    RAISE NOTICE '-------------------------------------------------------';

    -- Test 2.1 : Réciprocité sur expenses
    SELECT COUNT(*) INTO v_count FROM public.expenses WHERE user_id = v_user_a;
    IF v_count <> 0 THEN RAISE EXCEPTION 'FAIL RLS Expenses : B peut voir les dépenses de A !'; END IF;
    SELECT COUNT(*) INTO v_count FROM public.expenses WHERE user_id = v_user_b;
    IF v_count <> 1 THEN RAISE EXCEPTION 'FAIL RLS Expenses : B ne peut pas voir sa propre dépense !'; END IF;
    RAISE NOTICE '✅ [PASS] RLS public.expenses : B ne voit pas A';

    -- Test 2.2 : Réciprocité sur budgets
    SELECT COUNT(*) INTO v_count FROM public.budgets WHERE user_id = v_user_a;
    IF v_count <> 0 THEN RAISE EXCEPTION 'FAIL RLS Budgets : B peut voir le budget de A !'; END IF;
    RAISE NOTICE '✅ [PASS] RLS public.budgets : B ne voit pas A';

    -- Test 2.3 : Réciprocité sur category_rules
    SELECT COUNT(*) INTO v_count FROM public.category_rules WHERE user_id = v_user_a;
    IF v_count <> 0 THEN RAISE EXCEPTION 'FAIL RLS Category_rules : B peut voir les règles de A !'; END IF;
    RAISE NOTICE '✅ [PASS] RLS public.category_rules : B ne voit pas A';

    -- Test 2.4 : Réciprocité sur profiles
    SELECT COUNT(*) INTO v_count FROM public.profiles WHERE id = v_user_a;
    IF v_count <> 0 THEN RAISE EXCEPTION 'FAIL RLS Profiles : B peut voir le profil de A !'; END IF;
    RAISE NOTICE '✅ [PASS] RLS public.profiles : B ne voit pas A';

    RAISE NOTICE '=======================================================';
    RAISE NOTICE '🏆 RÉSULTAT FINAL : ISOLATION RLS 100%% VALIDÉE SUR TOUTES LES TABLES !';
    RAISE NOTICE '=======================================================';
END $$;

-- Rollback systématique pour ne laisser aucune trace de test
ROLLBACK;
