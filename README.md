# 🎓 NyeGa — "Own your spending"
### Application Web Mobile-First de Gestion de Budget pour Étudiants Togolais
#### Devise : **FCFA** (sans centimes) • Catégorisation Automatique par IA & Dictionnaire Local

Bienvenue dans le projet **NyeGa**, une application web complète, fonctionnelle et prête pour la production, spécialement adaptée au quotidien des **étudiants togolais** (Lomé, Kara, campus universitaires).

Le projet réutilise la structure technique, les composants d'interface, la typographie (**Nunito** pour les titres, **DM Sans** pour le corps), les espacements et les arrondis de bordure (12px) du template **VaultEdge**, tout en appliquant la palette de marque extraite du logo officiel.

---

## 🇹🇬 1. Spécificités & Devise FCFA

- **Cible :** Étudiants togolais.
- **Devise :** **FCFA** (entiers, sans centimes, formatage officiel `formatFCFA()`, ex: `500 FCFA`, `1 500 FCFA`, `50 000 FCFA`).
- **Montants rapides :** `+ 100 F`, `+ 200 F`, `+ 500 F`, `+ 1 000 F`, `+ 2 000 F`, `+ 5 000 F`.
- **Budget par défaut :** `50 000 FCFA` par mois (ajustable dans l'écran Budget).

---

## ⚡ 2. Catégorisation Automatique des Dépenses

L'étudiant saisit simplement un **montant** et une **description libre** (ex: *"zem pour aller au campus"*, *"pain + oeuf ce matin"*, *"pass nuit moov"*, *"maquis castel"*).
**L'étudiant ne choisit pas la catégorie : elle est déterminée automatiquement.**

### Les 7 Catégories Officielles :
1. **Alimentation** (nourriture, repas, ayimolou, fufu, atassi, pain, sandwich, resto U...)
2. **Transport** (zem, taxi, moto, bus campus, carburant, déplacements...)
3. **Soins et beauté** (gloss, tresses, mèches, savon, pommade, parfum, coiffure...)
4. **Connexion internet** (forfaits internet, pass data, nuit/semaine/mois, Togocom, Moov, wifi...)
5. **Crédit d'appel** (recharges de crédit, transfert d'unités, appels, forfaits voix...) *(Note : TMoney et Flooz sont des moyens de paiement, pas une catégorie)*
6. **Plaisirs** (maquis, sorties, cinéma, bière, plage de Lomé, détente, chill...)
7. **Autres** (photocopies, fournitures scolaires, divers...)

### Ordre de Classification (du moins cher au plus cher) :
1. **Mémoire utilisateur (`category_rules`)** : Table SQL stockant les correspondances `mot-clé → catégorie` apprises lors des corrections passées de l'utilisateur. Si un mot-clé correspond, **aucun appel IA n'est effectué**.
2. **Mots-clés locaux (`LOCAL_DICTIONARY`)** : Dictionnaire embarqué dans [`js/local-dictionary.js`](file:///C:/Users/DELL/Documents/NyeGa/nyega-web/js/local-dictionary.js) contenant le vocabulaire togolais (zem, taxi, ayimolou, fufu, pass data, gloss, tresses, maquis...). Si une correspondance nette est trouvée, **aucun appel IA n'est effectué**.
3. **IA (Gemini 3.1 Flash-Lite)** : Invoquée via la Supabase Edge Function [`categorize-expense`](file:///C:/Users/DELL/Documents/NyeGa/supabase/functions/categorize-expense/index.ts) uniquement si les étapes 1 et 2 n'ont pas tranché. Le modèle utilisé (`gemini-3.1-flash-lite`) est entièrement configurable via variable d'environnement `GEMINI_MODEL`.
4. **Plan B / Fallback** : Si l'IA échoue, dépasse 4 secondes, subit une erreur de quota (429) ou renvoie une confiance `< 0.6` : la dépense est classée en **"Autres"**, clairement signalée, **sans jamais bloquer l'enregistrement**.

### 👆 Correction en 1 Tap & Apprentissage Continu :
- La catégorie s'affiche sous forme de pastille interactive.
- L'étudiant peut corriger la catégorie en **un seul tap** via une feuille de sélection instantanée.
- Lorsqu'il corrige la catégorie, le mot-clé est automatiquement enregistré dans la table `category_rules` de l'utilisateur (protégée par RLS) : NyeGa devient plus intelligent à chaque utilisation !

---

## 🎨 3. Palette de Couleurs & Conformité WCAG

Couleurs extraites du logo officiel NyeGa ([`Logos/Logo_SANS_FOND.png`](file:///C:/Users/DELL/Documents/NyeGa/Logos/Logo_SANS_FOND.png)) :

| Rôle Visuel | Élément du Logo | Code Hex | Nuance & Rôle dans l'Interface |
| :--- | :--- | :--- | :--- |
| **Primaire** | Capuchon étudiant & Texte "Nye" | `#002D7A` | Boutons d'action majeurs, en-têtes, éléments actifs |
| **Secondaire / Accent** | Feuille & Texte "Ga" | `#10B982` | Succès, validation, catégorie Alimentation |
| **Tertiaire** | Croissant dynamique inférieur | `#FBB418` | Catégorie Transport, alertes douces |
| **Danger / Critique** | Alerte standardisée | `#DC2626` | Dépassement de budget, seuil critique |
| **Fond Neutre (Surface)** | Arrière-plan global | `#F8FAFC` | Fond très clair légèrement bleuté / ardoise |
| **Surface Card** | Cartes & Modales | `#FFFFFF` | Fond blanc pur |
| **Texte Principal** | Titres & Chiffres | `#0F172A` | Ardoise très foncée (WCAG AAA 17.85:1) |
| **Texte Secondaire** | Sous-titres & Libellés | `#475569` | Gris foncé / Ardoise médium (WCAG AAA 7.58:1) |
| **Statut "Normal"** | Indicateur de budget sain | `#16A34A` | Vert d'état sémantique distinct du vert de marque |

---

## 🏗️ 4. Arborescence du Projet

```text
NyeGa/
├── nyega-web/                                 # Application web autonome
│   ├── index.html                             # Écrans 2 à 6 avec catégorisation auto
│   ├── auth.html                              # Écran 1 (Connexion avec Logo officiel)
│   ├── css/
│   │   ├── nyega-theme.css                    # Design tokens sémantiques centralisés
│   │   ├── nyega-app.css                      # Styles responsive & popover 1-tap
│   │   ├── bootstrap.min.css                  # Bootstrap 4 (VaultEdge)
│   │   └── font-awesome.min.css               # Icônes FontAwesome (VaultEdge)
│   ├── js/
│   │   ├── config.js                          # Configuration Supabase
│   │   ├── local-dictionary.js                # Dictionnaire togolais & résolveur 2 étapes
│   │   ├── supabase-client.js                 # Client DB, formatFCFA, pipeline auto-cat
│   │   ├── auth.js                            # Contrôleur d'authentification Supabase Auth
│   │   ├── app.js                             # Contrôleur applicatif, 1-tap picker, Chart.js
│   │   ├── jquery.min.js                      # Librairies VaultEdge
│   │   └── bootstrap.min.js
│   ├── fonts/                                 # Polices FontAwesome
│   ├── img/logo/                              # Logo officiel (utilisé sur auth.html uniquement)
│   └── package.json                           # Script npm start
├── supabase/
│   ├── functions/
│   │   └── categorize-expense/                # Edge Function de Catégorisation IA
│   │       ├── index.ts                       # Point d'entrée Deno, JWT, Rate-limit (30 req/h)
│   │       ├── ai-provider.ts                 # Fournisseur d'IA Isolé (Gemini Flash-Lite)
│   │       └── .env.example                   # Exemple de variable GEMINI_API_KEY
│   ├── migrations/
│   │   └── 20260930_categorize_rules.sql      # Migration SQL : category_rules, FCFA, RLS
│   └── schema.sql                             # Schéma SQL complet initialisé
├── theme.dart                                 # Bonus : ColorScheme Flutter Material 3
├── .env.example                               # Variables d'environnement racine
├── index.html                                 # Redirection automatique vers nyega-web/
└── README.md                                  # Documentation technique complète
```

---

## 🤖 5. Supabase Edge Function & Gemini 3.1 Flash-Lite

> [!IMPORTANT]
> **Note de maintenance des modèles :** Vérifier régulièrement la page des dépréciations Gemini, les modèles sont retirés sans préavis long (ex: `gemini-2.0-flash-lite` arrêté le 1er juin 2026). Le modèle actif par défaut est désormais **`gemini-3.1-flash-lite`**.

### 5.1 Obtenir une clé API Gemini (Gratuit)
1. Rendez-vous sur [Google AI Studio](https://aistudio.google.com/).
2. Connectez-vous avec votre compte Google.
3. Cliquez sur **"Get API key"** puis sur **"Create API key in new project"**.
4. Copiez votre clé secrète (commençant généralement par `AIzaSy...`).

### 5.2 Stocker les secrets dans Supabase
La clé Gemini ne doit **jamais** figurer dans le code client ou sur git. Elle est stockée dans les secrets de votre projet Supabase avec le modèle IA souhaité :

```bash
# Avec le Supabase CLI :
supabase secrets set GEMINI_API_KEY="AIzaSyVotreCleSecreteIci"
supabase secrets set GEMINI_MODEL="gemini-3.1-flash-lite"

# Vérifier les secrets configurés :
supabase secrets list
```

*Alternative via le Dashboard Supabase :*
Rendez-vous dans votre projet Supabase > **Project Settings** > **Edge Functions** > **Secrets** > Ajouter `GEMINI_API_KEY` et `GEMINI_MODEL`.

### 5.3 Déployer l'Edge Function
Assurez-vous d'avoir lié votre projet Supabase (`supabase link --project-ref votre-ref`) puis lancez :

```bash
supabase functions deploy categorize-expense --no-verify-jwt=false
```

Pour tester l'Edge Function en local :
```bash
supabase functions serve categorize-expense --env-file supabase/functions/categorize-expense/.env.example
```

### 5.4 Changer de Modèle d'IA ou de Fournisseur
Le modèle par défaut est **`gemini-3.1-flash-lite`**. Il est directement configurable sans toucher au code grâce à la variable d'environnement `GEMINI_MODEL` :

```bash
supabase secrets set GEMINI_MODEL="gemini-3.1-flash-lite"
```

Le fournisseur d'IA est **entièrement isolé** dans le fichier [`supabase/functions/categorize-expense/ai-provider.ts`](file:///C:/Users/DELL/Documents/NyeGa/supabase/functions/categorize-expense/ai-provider.ts).

Pour brancher un autre fournisseur (OpenAI, Mistral, Groq, Claude) :
Il suffit de créer une nouvelle classe implémentant `AIProvider` dans `ai-provider.ts` sans modifier aucune autre ligne du projet.

---

## 🗄️ 6. Schéma SQL & Politiques RLS

Le fichier [`supabase/schema.sql`](file:///C:/Users/DELL/Documents/NyeGa/supabase/schema.sql) (et les migrations dans [`supabase/migrations/`](file:///C:/Users/DELL/Documents/NyeGa/supabase/migrations/)) contiennent :
- **Table `profiles`** : Profils étudiants avec devise par défaut `FCFA`.
- **Table `categories`** : Les 7 catégories officielles togolaises.
- **Table `budgets`** : Budget par période en FCFA (défini par l'étudiant via un écran dédié à l'inscription).
- **Table `expenses`** : Dépenses en FCFA avec moyen de paiement et date.
- **Table `category_rules`** : Table de mémoire utilisateur avec contrainte d'unicité `(user_id, keyword)`.
- **Table `rate_limits`** : Compteur de requêtes IA (30 req/h glissante) par étudiant avec reset automatique.
- **Politiques Row Level Security (RLS)** actives sur chaque table : chaque étudiant n'accède qu'à ses propres données (`auth.uid() = user_id`).
- **Politiques Row Level Security (RLS)** actives sur chaque table : chaque étudiant n'accède qu'à ses propres données.

---

## 🚀 7. Installation & Lancement Rapide

### Option A — Avec Node.js / npx (Recommandé) :
```bash
cd nyega-web
npx serve -l 3000
```
Ouvrez ensuite votre navigateur sur **`http://localhost:3000`**.

### Option B — Avec Python :
```bash
python -m http.server 8000
```
Ouvrez votre navigateur sur **`http://localhost:8000/nyega-web/`**.
"# NyeGa" 
