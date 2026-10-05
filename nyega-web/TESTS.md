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

- [ ] Bug 2 — Clôture automatique de budget expiré
- [ ] Dépenses : saisie et modification de montant
