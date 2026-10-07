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
| Budget avec `period_end` = hier → ouvrir l'app | Toast "Votre période budgétaire est terminée" + redirection écran Budget | ✅ Validé |
| Budget avec `period_end` = aujourd'hui → ouvrir l'app | Budget encore actif (non clôturé) | ✅ Validé |
| Jamais configuré → ouvrir l'app | Modale onboarding s'ouvre | ✅ Validé |
| Budget clôturé → configurer un nouveau budget | Nouveau budget `status='active'` enregistré, dashboard mis à jour | ✅ Validé |
| Appeler `close_expired_budgets()` deux fois | Aucun effet sur un budget déjà clôturé (idempotente) | ✅ Validé |

---

## 🏦 Caisse d'épargne étudiante & Cycles de périodes (Fonctionnalités PT3)

> ⚠️ Tests à exécuter sur compte de test avec Supabase connecté.

### Cas de test Caisse & Cycles

| Réf | Scénario | Données / Action | Comportement attendu |
|---|---|---|---|
| **C-01** | **Affichage solde caisse** | Ouverture de l'accueil avec mouvements existants | Solde affiché en FCFA (`formatFCFA`), 3 derniers mouvements avec dates et montants colorés (+ / -). |
| **C-02** | **Caisse vide** | Nouvel utilisateur sans reste de budget | Carte "Ma caisse" affiche "0 FCFA" et message d'état vide : "Aucun mouvement pour l'instant." |
| **C-03** | **Caisse indisponible (Résilience)** | Réseau coupé ou Supabase injoignable | Carte affiche message clair : "Caisse indisponible, réessaie". Aucun montant issu du cache local (strictement 0 repli local). |
| **C-04** | **Clôture avec reste positif** | Budget 50 000 F, dépensé 38 000 F, période échue | Toast : *"Ta période est terminée. Il te restait 12 000 FCFA, ajoutés à ta caisse."*, versement immédiat dans la caisse. |
| **C-05** | **Clôture avec dépassement** | Budget 40 000 F, dépensé 43 000 F, période échue | Toast bienveillant : *"Ta période est terminée avec un dépassement de 3 000 FCFA. C'est l'occasion de repartir du bon pied pour ta prochaine période !"*, aucun versement caisse. |
| **C-06** | **Clôture multiple (Plusieurs périodes)** | Utilisateur absent 2 cycles complets | Un seul toast récapitulatif agrégé notifiant la clôture sans spam visuel. |
| **C-07** | **Clôture au retour d'onglet (> 1 heure)** | Minuteur / inactivité onglet supérieure à 60 min | Événement `visibilitychange` déclenche automatiquement `close_expired_budgets()` sans rechargement de page. |
| **C-08** | **Bouton "Même budget, nouvelle période"** | Période précédente terminée le 30 sept | Clic sur le bouton : pré-remplit la date de début au 1er oct (lendemain), montant identique, champ de date déverrouillé. |
| **C-09** | **Verrouillage date début en modification** | Budget actif en cours de modification | `#budgetStartDate` est désactivé (`disabled`) avec texte : *"La date de début ne peut pas être changée."*. |
| **C-10** | **Refus dépense sur période clôturée** | Saisie d'une dépense datée dans une période terminée | Rejet SQL capté : message *"Cette période est terminée, choisis une date plus récente."* affiché près du champ date. Saisie intégrale conservée sans perte. |
| **C-11** | **Filtre historique par période** | Sélection "Cette période" / "Période précédente" / "Tout" | Filtre dynamique des dépenses selon l'intervalle temporel sélectionné. |
| **C-12** | **Résumé des périodes terminées** | Écran Historique | Bloc récapitulatif affichant pour chaque cycle clos : dates, budget alloué, dépensé et badge solde (+ reste / - dépassement). |
| **C-13** | **Notice d'antériorité accueil** | Accueil avec budget actif | Phrase discrète visible : *"Les dépenses d'avant le [date de début] comptent pour ta période précédente."*. |
| **C-14** | **Neutralisation injection CSV (CWE-1236)** | Libellé dépense ou note débutant par `=`, `+`, `-`, `@` | Cellule neutralisée avec apostrophe de protection `'` dans l'export `nyega_depenses_*.csv` et `nyega_caisse_*.csv`. |
| **C-15** | **Suppression de compte stricte (Loi 2019-014)** | Clic "Supprimer mon compte" et mot-clé "SUPPRIMER" | Appel RPC `delete_user_account`. Si échec : message d'erreur, pas de déconnexion. Si succès : `signOut()`, purge `localStorage` et redirection `auth.html`. |

