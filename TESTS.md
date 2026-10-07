# 🧪 Scénarios de Tests Manuels — NyeGa

Ce document détaille les scénarios de tests manuels pour valider les fonctionnalités critiques de l'application **NyeGa** :
1. **Plan B (Fallback Sécurisé IA)**
2. **Isolation Stricte entre Deux Comptes (RLS)**
3. **Mémoire des Corrections & Apprentissage en 1 Tap**
4. **Écran de Budget Mensuel à l'Inscription**

---

## 🛠️ Prérequis aux Tests

1. **Lancement du serveur frontend :**
   ```bash
   cd nyega-web
   npx serve -l 3000
   # Ouvrir http://localhost:3000
   ```
2. **Configuration Supabase :**
   - Assurez-vous d'avoir appliqué les fichiers SQL de migration :
     - `supabase/schema.sql`
     - `supabase/migrations/20260930_categorize_rules.sql`
     - `supabase/migrations/20260930_rate_limits.sql`
   - Renseignez l'URL et l'Anon Key Supabase dans `nyega-web/js/config.js` ou via le bouton **"⚙️ Paramètres Supabase"** sur l'écran de connexion (`auth.html`).

---

## 🧪 Scénario 1 : Plan B & Fallback Sécurisé de l'IA

### Objectif :
Garantir que même en cas de panne de l'IA, de dépassement de quota (429), de coupure réseau ou de score de confiance faible, **l'enregistrement de la dépense n'est JAMAIS bloqué**, et que la dépense est classée en **"Autres"**.

### Étape 1.1 : Test sans clé API Gemini (Clé manquante)
1. Dans l'Edge Function Supabase, laissez `GEMINI_API_KEY` non configurée ou donnez-lui une valeur invalide.
2. Rendez-vous sur l'écran **"Ajouter"** (`index.html#ajout`).
3. Saisissez un montant de `1 500 FCFA`.
4. Saisissez une description libre non présente dans le dictionnaire local, par exemple :
   `achat de materiel inconnu`
5. Cliquez sur **"Enregistrer immédiatement"**.
6. **Résultats attendus :**
   - L'application ne plante pas et n'affiche pas d'erreur bloquante.
   - La dépense est enregistrée dans Supabase avec la catégorie **"Autres"**.
   - Le message toast confirme : *"Dépense de 1 500 FCFA enregistrée (Autres) !"*.
   - La dépense apparaît immédiatement sur le tableau de bord et dans l'historique.

### Étape 1.2 : Test de Dépassement de Quota / Erreur 429
1. Simulez une réponse HTTP 429 ou épuisez le quota de la clé Gemini.
2. Saisissez une dépense inédite (ex: `reparation ventilo`).
3. Validez l'enregistrement.
4. **Résultats attendus :**
   - L'Edge Function intercepte le code 429 et renvoie silencieusement `{"category": "Autres", "confidence": 0.0, "source": "fallback"}`.
   - L'étudiant ne subit aucun temps d'attente prolongé ni message d'erreur technique.

### Étape 1.3 : Test du Timeout Strict (4 secondes)
1. Simulez une latence réseau supérieure à 4 secondes sur l'Edge Function.
2. Soumettez une dépense.
3. **Résultats attendus :**
   - Au bout de 4 secondes exactement, le `Promise.race` client coupe la requête.
   - La dépense bascule instantanément sur la catégorie **"Autres"** et s'enregistre normalement.

### Étape 1.4 : Test de Description Vague (Confiance < 0.6)
1. Avec l'IA active, saisissez une description délibérément ambiguë, ex : `un truc` ou `machin`.
2. Soumettez la dépense.
3. **Résultats attendus :**
   - Si le modèle retourne une confiance inférieure à 0.6, l'application requalifie automatiquement la dépense en **"Autres"**.

### Étape 1.5 : Test du Rate Limit (30 requêtes / heure)
1. Effectuez 30 requêtes consécutives vers l'IA via le même compte étudiant.
2. À la 31ᵉ requête, observez la réponse.
3. **Résultats attendus :**
   - La table `rate_limits` atteint `request_count = 30`.
   - La 31ᵉ requête renvoie directement `source: "rate_limit_fallback"` avec la catégorie **"Autres"** sans appeler l'API Gemini.
   - La dépense est enregistrée avec succès.

---

## 🧪 Scénario 2 : Isolation Stricte entre Deux Comptes (RLS)

### Objectif :
Valider que la sécurité au niveau des lignes (**Row Level Security**) est 100% étanche entre deux étudiants : aucune fuite de dépenses, de budget, de règles de catégorisation ou de quota.

### Étape 2.1 : Configuration du Compte Étudiant A
1. Rendez-vous sur `auth.html` > Onglet **Inscription**.
2. Créez le compte :
   - **Nom :** `Koffi Mensah`
   - **Email :** `koffi.a@univ-lome.tg`
   - **Mot de passe :** `Password123!`
3. Cliquez sur **"Créer mon compte NyeGa"**.
4. L'écran de budget initial apparaît :
   - Saisissez `45 000 FCFA`.
   - Cliquez sur **"Valider mon budget et commencer"**.
5. Sur l'écran **"Ajouter"**, ajoutez 2 dépenses :
   - Dépense 1 : `500 FCFA` — `Zem campus matin` (Transport)
   - Dépense 2 : `1 200 FCFA` — `Ayimolou + oeuf` (Alimentation)
6. Allez dans l'Historique : vérifiez que 2 dépenses sont présentes pour un total de `1 700 FCFA`.
7. Cliquez sur l'icône de déconnexion dans l'en-tête.

### Étape 2.2 : Configuration du Compte Étudiant B
1. Sur `auth.html` > Onglet **Inscription**, créez le second compte :
   - **Nom :** `Afiwa Tossou`
   - **Email :** `afiwa.b@univ-lome.tg`
   - **Mot de passe :** `Password123!`
2. Sur l'écran de budget initial :
   - Saisissez un budget différent : `80 000 FCFA`.
   - Validez.
3. **Vérifications immédiates sur le tableau de bord d'Afiwa :**
   - **Budget total affiché :** `80 000 FCFA` (le budget de 45 000 FCFA de Koffi n'apparaît pas).
   - **Dépensé :** `0 FCFA`.
   - **Liste des dépenses :** État vide (*"Aucune dépense enregistrée"*). Les 2 dépenses de Koffi sont totalement invisibles.
4. Sur le compte d'Afiwa, ajoutez une dépense :
   - `3 000 FCFA` — `Pass internet Togocom` (Connexion internet).
5. Vérifiez l'Historique d'Afiwa : seule cette dépense de `3 000 FCFA` est visible.

### Étape 2.3 : Reconnexion sur le Compte Étudiant A
1. Déconnectez Afiwa et reconnectez-vous avec `koffi.a@univ-lome.tg`.
2. **Vérifications :**
   - Le budget total de Koffi est toujours de `45 000 FCFA`.
   - Le total dépensé est toujours de `1 700 FCFA`.
   - La dépense de 3 000 FCFA d'Afiwa n'apparaît nulle part.

### Étape 2.4 : Vérification Technique RLS
1. Ouvrez la console développeur du navigateur (F12) sur le compte de Koffi.
2. Exécutez :
   ```javascript
   const { data: exp } = await supabase.from('expenses').select('*');
   console.log('Dépenses visibles :', exp.length);
   ```
3. **Résultat attendu :** Seules les dépenses appartenant au `auth.uid()` de Koffi sont retournées par l'API Supabase.

---

## 🧪 Scénario 3 : Mémoire des Corrections (Apprentissage en 1 Tap)

### Objectif :
Valider que la correction d'une catégorie par l'étudiant :
1. Ignore les mots vides français (`pour`, `chez`, `avec`, `de`, `le`...).
2. Extrait le mot le plus significatif.
3. Enregistre la règle dans la table `category_rules` de l'étudiant.
4. Réutilise instantanément la règle lors des prochaines saisies sans aucun appel IA.

### Étape 3.1 : Saisie d'une dépense avec mots vides
1. Connectez-vous sur votre compte étudiant.
2. Allez sur l'écran **"Ajouter"**.
3. Montant : `1 000 FCFA`.
4. Description :
   `course en zem pour aller chez ma tante`
5. La pastille indique initialement une catégorie détectée (ou "Autres").
6. Cliquez sur la pastille interactive **"Catégorie détectée"** (ou sur la pastille dans l'Historique après enregistrement).
7. Le panneau **"Choisir la catégorie (1 tap)"** s'ouvre.
8. Cliquez sur **"Transport"**.

### Étape 3.2 : Vérification de l'extraction du mot-clé significatif
1. Observez la notification toast :
   - Elle doit afficher : `Règle mémorisée : "zem" → Transport`.
2. **Contrôle d'exclusion des mots vides :**
   - Les mots *"course"*, *"en"*, *"pour"*, *"aller"*, *"chez"*, *"ma"* ont été ignorés.
   - Le mot-clé le plus significatif du domaine togolais (*"zem"*) a été retenu.

### Étape 3.3 : Vérification de l'application immédiate de la mémoire (sans IA)
1. Toujours sur l'écran **"Ajouter"**, commencez à taper une nouvelle description :
   `zem avec des amis ce soir`
2. Observez la pastille de catégorie en temps réel :
   - Elle affiche immédiatement **"Transport"** avec le badge **"mémorisé"**.
3. Enregistrez la dépense.
4. Ouvrez l'onglet Réseau (Network) des DevTools :
   - **Aucun appel réseau vers la fonction `categorize-expense` n'a été émis.**
   - La catégorisation a été résolue instantanément en local grâce à la règle mémorisée.

### Étape 3.4 : Correction depuis l'Historique
1. Allez dans l'écran **"Historique"**.
2. Sur une dépense existante, cliquez directement sur le badge de sa catégorie.
3. Choisissez une autre catégorie (ex: reclasser de "Autres" vers "Alimentation").
4. **Résultats attendus :**
   - La pastille de la ligne se met à jour immédiatement avec la nouvelle couleur et icône.
   - Les graphiques et totaux de l'écran **"Analyse"** sont recalculés instantanément.
   - La règle est mise à jour dans Supabase `category_rules`.

---

## 🧪 Scénario 4 : Écran de Budget Mensuel à l'Inscription

### Objectif :
Valider qu'à la création d'un compte, **aucun budget arbitraire de 50 000 FCFA n'est imposé silencieusement**, et qu'un écran dédié permet à l'étudiant de renseigner son véritable budget.

### Étape 4.1 : Flux d'inscription
1. Rendez-vous sur `auth.html` > **Inscription**.
2. Remplissez le formulaire avec un nouvel email (ex: `nouveau.etudiant@univ.tg`).
3. Cliquez sur **"Créer mon compte NyeGa"**.
4. **Résultat attendu :**
   - L'écran ne redirige pas directement vers l'accueil.
   - L'écran **"Étape 2/2 : Votre Budget"** s'affiche.
   - Le titre indique : *"Quel est votre budget pour ce mois ?"*.
   - Le champ de saisie est centré, vide, invitant à la saisie en FCFA.

### Étape 4.2 : Utilisation des raccourcis ou saisie personnalisée
1. Cliquez sur le bouton rapide **"30 000 F"** (ou saisissez un montant personnalisé comme `42 500`).
2. Cliquez sur **"Valider mon budget et démarrer"**.
3. **Résultat attendu :**
   - Redirection vers l'accueil (`index.html#accueil`).
   - Le widget principal affiche :
     - **Budget restant disponible :** `30 000 FCFA` (ou `42 500 FCFA`).
     - **Budget total :** `30 000 FCFA` (ou `42 500 FCFA`).
     - **Budget journalier conseillé :** calculé sur la base de ce budget exact et du nombre de jours restants dans le mois.
   - Dans Supabase, la table `budgets` contient une seule ligne pour cet utilisateur avec le montant exact choisi.

---

## 📋 Tableau Récapitulatif des Tests

| Réf | Scénario | Conditions | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **T-01** | Plan B : Clé Gemini absente | Pas de `GEMINI_API_KEY` | Dépense classée "Autres", non bloquante | ✅ Conforme |
| **T-02** | Plan B : Timeout IA | Réponse IA > 4s | Bascule vers "Autres" à 4s pile | ✅ Conforme |
| **T-03** | Plan B : Erreur Quota 429 | Quota Gemini atteint | Bascule silencieuse vers "Autres" | ✅ Conforme |
| **T-04** | Rate limit 30 req/h | > 30 requêtes en 1h | Enregistrement dans table SQL `rate_limits`, fallback | ✅ Conforme |
| **T-05** | Isolation Comptes : RLS | Étudiant A vs Étudiant B | Aucune fuite de dépenses / budgets / règles | ✅ Conforme |
| **T-06** | Dictionnaire : TMoney & Flooz | Description "payer par TMoney" | TMoney/Flooz non traités comme Crédit d'appel | ✅ Conforme |
| **T-07** | Dictionnaire : Forfait seul | Description "forfait" | Passe à l'IA pour arbitrage internet vs voix | ✅ Conforme |
| **T-08** | Mémoire : Mots vides | "zem pour aller chez ami" | Mot "zem" extrait, mots vides français ignorés | ✅ Conforme |
| **T-09** | Mémoire : Réutilisation | Saisie future avec "zem" | Catégorisation locale sans appel IA | ✅ Conforme |
| **T-10** | Budget à l'inscription | Nouveau compte créé | Écran demandant le budget mensuel, pas de 50k forcé | ✅ Conforme |
| **T-11** | Caisse : Solde et mouvements | Compte connecté | Solde FCFA et 3 derniers mouvements affichés sur l'accueil | ✅ Conforme |
| **T-12** | Caisse : Résilience hors-ligne | Supabase injoignable | Message "Caisse indisponible, réessaie", aucun repli local | ✅ Conforme |
| **T-13** | Clôture automatique (reste) | Fin de cycle avec solde > 0 | `close_expired_budgets()` verse le reste dans la caisse | ✅ Conforme |
| **T-14** | Clôture automatique (dépassement) | Fin de cycle avec dépassement | Toast bienveillant, aucun versement caisse | ✅ Conforme |
| **T-15** | Clôture multiple consolidée | Plusieurs cycles expirés | Un unique toast consolidé sans duplication | ✅ Conforme |
| **T-16** | Budget : Nouvelle période | Cycle précédent clos | Bouton "Même budget, nouvelle période" proposant J+1 | ✅ Conforme |
| **T-17** | Budget : Date début verrouillée | Modification budget actif | `#budgetStartDate` disabled avec message explicatif | ✅ Conforme |
| **T-18** | Dépense période clôturée | Saisie date dans cycle clos | Message près de la date sans perte de saisie | ✅ Conforme |
| **T-19** | Historique : Filtre période | Choix du filtre de période | Affichage strict selon période et récapitulatif clos | ✅ Conforme |
| **T-20** | Anti-injection CSV & Suppression | Export CSV / Effacement compte | Protection formule CWE-1236 et RPC `delete_user_account` | ✅ Conforme |
