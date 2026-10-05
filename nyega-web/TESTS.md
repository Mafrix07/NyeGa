# TESTS.md — NyeGa Test Cases (compte de test uniquement)

> ⚠️ Ces tests sont à exécuter **uniquement sur le compte de test** — jamais sur un compte utilisateur réel.

---

## Budget — Saisie du montant (Bug 1 fix)

### Cas acceptés (entiers positifs)

| Montant saisi | Attendu | Résultat |
|---|---|---|
| `1` | ✅ Budget enregistré : 1 FCFA | |
| `1300` | ✅ Budget enregistré : 1 300 FCFA | |
| `999999` | ✅ Budget enregistré : 999 999 FCFA | |

### Cas rejetés

| Montant saisi | Attendu | Résultat |
|---|---|---|
| `0` | ❌ Toast : "Veuillez spécifier un budget valide en FCFA (entier positif)" | |
| `-5` | ❌ Toast ou champ invalide (min="1") | |
| `abc` | ❌ Champ invalide nativement (type="number") | |

### Champs concernés
- `#budgetAmount` — écran Configuration du Budget
- `#initialModalBudgetAmount` — modale onboarding premier lancement

---

## À compléter lors des prochaines étapes

- [x] Bug 2 — Clôture automatique de budget expiré
- [ ] Dépenses : saisie et modification de montant

---

## Budget — Expiration de la période (Bug 2 fix)

> ⚠️ Nécessite que le SQL ait été appliqué dans Supabase (voir ci-dessous).

### SQL à appliquer dans Supabase Dashboard → SQL Editor

```sql
-- 1. Ajouter la colonne status
ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'closed'));

CREATE INDEX IF NOT EXISTS idx_budgets_user_status
  ON budgets(user_id, status);

-- 2. Contrainte montant positif (Bug 1)
ALTER TABLE budgets ADD CONSTRAINT budgets_monthly_amount_positive
  CHECK (monthly_amount > 0);

-- 3. Fonction de clôture automatique (idempotente, fuseau Lomé)
CREATE OR REPLACE FUNCTION close_expired_budgets()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE budgets
  SET status = 'closed', updated_at = NOW() AT TIME ZONE 'Africa/Lome'
  WHERE status = 'active'
    AND period_end < (CURRENT_DATE AT TIME ZONE 'Africa/Lome');
END;
$$;
```

### Cas de test Bug 2

| Scénario | Attendu | Résultat |
|---|---|---|
| Budget avec `period_end` = hier → ouvrir l'app | Toast "Votre période budgétaire est terminée" + redirection écran Budget | |
| Budget avec `period_end` = aujourd'hui → ouvrir l'app | Budget encore actif (non clôturé) | |
| Jamais configuré → ouvrir l'app | Modale onboarding s'ouvre | |
| Budget clôturé → configurer un nouveau budget | Nouveau budget `status='active'` enregistré, dashboard mis à jour | |
| Appeler `close_expired_budgets()` deux fois | Aucun effet sur un budget déjà clôturé (idempotente) | |
