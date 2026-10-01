# DESIGN.md — Système de design NyeGa
## Référence visuelle : VaultEdge 1.0.0 (`css/custom-override.css`)
> Version 3.1 — Dérivé fidèlement de VaultEdge. Seule la section **Adaptations NyeGa** introduit des éléments propres à l'app.
> Le `style.css` de base (Raleway, Bootstrap complet, animate.css, jQuery) est **ignoré** pour le design — seul `custom-override.css` fait foi : template navy sombre + or, Nunito + DM Sans.

---

## 1. Typographie

### Polices (VaultEdge — `custom-override.css`)
| Rôle | Famille | Graisses fournies (woff2 locaux) |
|---|---|---|
| Titres (`h1`–`h6`) | **Nunito** | 400–600 (Regular), 700–900 (Bold) |
| Corps / Interface | **DM Sans** | 300–400 (Regular), 500–700 (Medium) |

> **Règle NyeGa** : polices hébergées **localement** (dossier `fonts/`), **pas de CDN Google Fonts**. L'`@import Google Fonts` du template est retiré. 2 polices maximum.
> **Fichiers à ajouter** si absents : `Nunito-Regular.woff2`, `Nunito-Bold.woff2`, `DMSans-Regular.woff2`, `DMSans-Medium.woff2` (sous-ensemble latin).

### Tailles — Échelle application mobile-first (≠ site vitrine)
| Élément | Mobile (défaut) | Tablette ≥768 px | Desktop ≥1024 px |
|---|---|---|---|
| `h1` principal | 24 px | 30 px | 36 px |
| `h2` section | 20 px | 24 px | 28 px |
| `h3` carte | 16–18 px | 18 px | 18–20 px |
| Corps `p` | 14 px, `line-height: 1.6` | 14–15 px | 15 px, `line-height: 1.7` |
| Petit texte / méta | 12 px | 12–13 px | 12–13 px |
| Label uppercase | 11 px, `letter-spacing: 1px`, `text-transform: uppercase` | 11–12 px | 12 px |
| Section tag (pill) | 11 px, `letter-spacing: 1.5px`, uppercase | 12 px | 12 px |
| Montant héros | 32 px, Nunito 900 | 36 px | 40 px |

> **Supprimés** : `h1 62 px`, section `padding: 100px`, preloader — valeurs de site vitrine non adaptées à une app mobile.

### Couleurs de texte
| Variable | Valeur | Usage |
|---|---|---|
| `--ny-on-surface` | `#0F172A` | Titres principaux |
| `--ny-on-surface-variant` | `#475569` | Corps de texte |
| Blanc | `#ffffff` | Texte sur fond sombre |
| `--ny-text-muted` | `#64748B` | Métadonnées / sous-titres |

---

## 2. Couleurs du template VaultEdge (`custom-override.css`)

| Variable CSS | Valeur | Rôle |
|---|---|---|
| `--ve-dark` | `#0d1b2a` | Fond navbar, hero, sections sombres |
| `--ve-dark2` | `#162032` | Fond dropdown, mobile menu |
| `--ve-navy` | `#1a2f4b` | Gradient fond sombre secondaire |
| `--ve-gold` | `#d4a017` | Accent principal CTA (sur fond navy uniquement) |
| `--ve-gold2` | `#e8b84b` | Hover de l'accent gold |
| `--ve-light` | `#f4f7fb` | Fond de sections claires |
| `--ve-white` | `#ffffff` | Fond cartes |
| `--ve-text` | `#4a5568` | Texte corps |
| `--ve-border` | `#e2e8f0` | Bordures cartes et séparateurs |

> **Source** : `custom-override.css` uniquement — palette navy sombre + or. Le `style.css` original (#1b3a6b bleu marine, #0e9c7f vert teal, Raleway) est ignoré pour le design NyeGa.

---

## 3. Variables de forme et effets

| Variable CSS | Valeur | Usage |
|---|---|---|
| `--ve-radius` | `12px` | Rayon de bordure standard |
| `--ve-shadow` | `0 8px 30px rgba(13,27,42,0.10)` | Ombre portée cartes |
| `--ve-trans` | `all 0.3s ease` | Transition standard |

### Rayons observés dans le template
| Composant | Rayon |
|---|---|
| Cartes (`.ve-service-card`, `.ve-testi-card`) | `12px` |
| Logo icon (`.ve-logo-icon`) | `8px` |
| Boutons (`.ve-btn-primary`, `.ve-cta-btn`) | `8px` |
| Bouton pill (`.credit-btn` override) | `50px` |
| Dropdown menu | `10px` |
| Images stack (`.ve-about-img-1`) | `16px` |
| Image accent (`.ve-hero-img-accent`) | `14px` |
| Badge ribbon | `12px` |
| Social icons | `8px` |
| Tags | `6px` |

---

## 4. Header / Navbar

### Structure VaultEdge (`custom-override.css`)
```
.ve-header          — fixed, top 0, z-index 9999, bg: --ve-dark
  .ve-nav-wrap      — flex, space-between, padding 0 40px, height 72px
    .ve-logo        — logo texte (jamais d'image)
    .ve-nav         — ul flex, gap 6px (liens desktop)
    .ve-nav-cta     — bouton CTA doré à droite
    .ve-toggler     — hamburger mobile (caché desktop)
  .ve-mobile-menu   — menu déroulant mobile (bg --ve-dark2)
```

### Logo (`.ve-logo`)
- Carré 38×38 px, `border-radius: 8px`, bg: `--ve-gold`, lettre initiale (Nunito 900, 20 px)
- Texte : Nunito 20 px, blanc ; `<strong>` en gold
- Pas d'image logo sur les pages app

### Liens nav (`.ve-nav ul li a`)
- 14 px, `font-weight: 500`, `rgba(255,255,255,0.8)`, `border-radius: 6px`, `padding: 8px 14px`
- `:hover` / `.active` → fond `rgba(--ve-gold, 0.15)`, blanc
- `.active` → couleur `--ve-gold`

### Dropdown (`.ve-dropdown`)
- bg `--ve-dark2`, `border-radius: 10px`, `padding: 10px 0`
- Apparition : `opacity 0→1`, `translateY(10px→0)` via hover `.has-drop`

### CTA bouton nav (`.ve-cta-btn`)
- bg `--ve-gold`, couleur `--ve-dark`, `border-radius: 8px`, `padding: 10px 22px`, `font-weight: 700`
- `:hover` → bg `--ve-gold2`, `translateY(-1px)`

### Responsive
- **≤991 px** : nav + CTA cachés, hamburger visible
- **≤767 px** : padding réduit à `0 20px`

---

## 5. Section Heading

### Composant original (`style.css`)
```html
<div class="section-heading [text-center] [white]">
  <div class="line"></div>   <!-- 25×5 px, border-radius 3px, bg #0e9c7f -->
  <p>Label uppercase</p>     <!-- 12px, letter-spacing 2px, #a5a5a5 -->
  <h2>Titre</h2>             <!-- 36px, #212121, font-weight 700 -->
</div>
```

### Composant override (`custom-override.css`)
| Élément | Style |
|---|---|
| `.ve-section-tag` | pill bg `rgba(--ve-gold,0.1)`, border, `border-radius:50px`, `padding:5px 16px`, `font-size:12px`, `font-weight:700`, uppercase, `letter-spacing:1.5px` |
| `.ve-section-header h2` | 42 px, `font-weight:900`, `line-height:1.2` ; `<span>` en `--ve-gold` |
| `.ve-section-header p` | 16 px, `color:--ve-text`, `max-width:580px`, `margin:0 auto` |

---

## 6. Boutons

### `.ve-btn-primary` (principal)
```css
background: --ve-gold;  color: --ve-dark;
padding: 14px 32px;  border-radius: 8px;
font-weight: 700;  font-size: 15px;
/* :hover → bg --ve-gold2, translateY(-2px), shadow gold */
```

### `.ve-btn-ghost` (outline)
```css
border: 2px solid rgba(255,255,255,0.25);  color: #fff;
padding: 12px 30px;  border-radius: 8px;  font-weight: 600;
/* :hover → border-color: --ve-gold, color: --ve-gold */
```

### `.ve-btn-white`
```css
background: #fff;  color: --ve-dark;
padding: 16px 34px;  border-radius: 8px;  font-weight: 800;
/* :hover → bg --ve-gold */
```

### `.credit-btn` (style.css brut, avec override pill)
```css
min-width: 175px;  height: 48px;
border-radius: 50px;   /* 5px natif, override pill */
padding: 0 30px;  font-size: 14px;  line-height: 48px;
font-weight: 700;  text-transform: uppercase;
```

---

## 7. Cartes

### `.ve-service-card`
```css
background: #fff;  border-radius: 12px;
padding: 36px 30px;  border: 1px solid --ve-border;
/* ::before → barre 3px bottom, scaleX(0→1) au hover */
/* :hover → translateY(-6px), box-shadow */
```

### `.ve-service-icon`
```css
width: 60px; height: 60px;
background: linear-gradient(135deg, --ve-dark, --ve-navy);
border-radius: 14px;  font-size: 26px;  color: --ve-gold;
```

### `.ve-testi-card`
```css
background: #fff;  border-radius: 12px;
padding: 32px 28px;  box-shadow: --ve-shadow;
border: 1px solid --ve-border;
/* :hover → translateY(-4px) */
```

### `.single-service-area` (avec override)
```css
background: #fff;  border-radius: 12px;
padding: 28px 24px;  box-shadow: 0 4px 20px rgba(0,0,0,0.07);
/* .icon → 56px, border-radius 50%, bg #f0f7f4 */
/* :hover → translateY(-4px) */
```

---

## 8. Formulaires

### Champ (`.ve-form-group input/select/textarea`)
```css
border: 1px solid --ve-border;  border-radius: 8px;
padding: 12px 16px;  font-size: 14px;  color: --ve-dark;
font-family: 'DM Sans';
/* :focus → border-color: --ve-gold, box-shadow: 0 0 0 3px rgba(--ve-gold,0.12) */
```

### Label
```css
font-size: 13px;  font-weight: 700;  color: --ve-dark;
margin-bottom: 7px;  text-transform: uppercase;  letter-spacing: 0.5px;
```

---

## 9. Espacements et sections

```css
.ve-section          { padding: 100px 0; }
.ve-section-header   { margin-bottom: 60px; }
.section-padding-100 { padding-top: 100px; padding-bottom: 100px; }
.mt-30               { margin-top: 30px; }
.mb-50               { margin-bottom: 50px; }
```

### Grilles
- Services : `repeat(3,1fr)`, gap 28 px → 2 col ≤1199 → 1 col ≤767
- Compteurs : `repeat(4,1fr)`, gap 30 px → 2 col ≤1199 → 1 col ≤767
- Témoignages : `repeat(3,1fr)`, gap 28 px → 2 col ≤1199 → 1 col ≤767

---

## 10. Preloader
```css
background: --ve-dark (ou #1b3a6b)
.lds-ellipsis div { background: --ve-gold (ou #0e9c7f) }
animation: lds-ellipsis, durée 0.6s infinite
```

---

## 11. Conventions de nommage VaultEdge

| Préfixe | Usage |
|---|---|
| `.ve-` | Composants custom-override (navbar, hero, cards, footer) |
| `.credit-` | Composants style.css original (bouton, nav, tabs) |
| `.single-` | Éléments répétables (`.single-service-area`, `.single-team-member-area`) |
| `.section-` | Utilitaires de section (`.section-heading`, `.section-padding-100`) |
| `.bg-` | Utilitaires de fond (`.bg-img`, `.bg-overlay`, `.bg-gray`) |

---

## Adaptations NyeGa

### A. Couleurs — Tokens du logo NyeGa (remplacent les valeurs VaultEdge)

#### Signature visuelle à conserver
- **Header navy très sombre** (`--ny-primary-dark`) sur fond de l'app
- **Carte héros sombre** pour le solde budget restant
- **Accent doré** (`--ny-tertiary` #FBB418) sur les boutons principaux **sur fond navy**
- **Titres Nunito gras** avec un mot en couleur (`<span>`)
- **Pastille de section** (`.ny-section-tag`, pill doré)
- **Cartes** avec barre colorée au survol (`::before` scaleX)

#### Tokens de couleur

| Token NyeGa | Valeur | Remplace VaultEdge | Usage |
|---|---|---|---|
| `--ny-primary-dark` | `#0A1F4D` | `--ve-dark` | Fond header principal, hero card sombre — version assombrie du bleu marine logo |
| `--ny-primary` | `#002D7A` | `--ve-dark` (variante claire) | Fond bouton sur fond clair, titre navy |
| `--ny-primary-hover` | `#001F56` | `--ve-dark2` | Hover bouton primaire |
| `--ny-primary-container` | `#EBF2FF` | `--ve-light` (variante) | Fond cartes conseils, chips actives |
| `--ny-tertiary` | `#FBB418` | `--ve-gold` | **Or du logo** — boutons principaux sur fond navy, pastilles, highlights |
| `--ny-on-tertiary` | `#002D7A` | `--ve-dark` | Texte navy sur bouton doré (contraste 7.03:1 ✓ AAA) |
| `--ny-tertiary-hover` | `#E5A110` | `--ve-gold2` | Hover accent doré |
| `--ny-secondary` | `#047857` | `--ve-gold` / `#0e9c7f` | **Vert de marque sur fond clair** — icônes, liens actifs, succès/validation |
| `--ny-secondary-hover` | `#065F46` | `--ve-gold2` | Hover vert de marque |
| `--ny-danger` | `#DC2626` | — | Budget dépassé, suppressions |
| `--ny-background` | `#F8FAFC` | `--ve-light` | Fond global app |
| `--ny-surface` | `#FFFFFF` | `--ve-white` | Fond cartes |
| `--ny-on-surface` | `#0F172A` | `--ve-dark` | Texte principal |
| `--ny-on-surface-variant` | `#475569` | `--ve-text` | Texte secondaire |
| `--ny-outline` | `#E2E8F0` | `--ve-border` | Bordures |
| `--ny-radius` | `12px` | `--ve-radius` | **Identique** |
| `--ny-shadow` | `0 8px 30px rgba(0,45,122,0.08)` | `--ve-shadow` | Teinte bleu NyeGa |
| `--ny-transition` | `all 0.25s cubic-bezier(0.4,0,0.2,1)` | `--ve-trans` | Légèrement plus rapide |

> **Règle boutons** :
> - Fond navy (`--ny-primary-dark` / `--ny-primary`) → bouton doré (`--ny-tertiary`) + texte navy (`--ny-on-tertiary`)
> - Fond clair (`--ny-background` / `--ny-surface`) → bouton navy (`--ny-primary`) + texte blanc
> - **L'or (#FBB418) n'est jamais utilisé sur fond blanc** (contraste 1.80:1 — interdit)

> **Token `--ny-primary-dark`** : proposé à `#0A1F4D` (contraste sur blanc : 12.8:1 ✓ AAA). Alternative plus sombre : `#0D1B2A` (13.9:1). À vérifier selon rendu logo.

---

### B. Contrastes WCAG — Tableau de référence

> **WCAG AA** : ratio ≥ 4.5:1 (texte normal), ≥ 3:1 (grand texte / UI). **WCAG AAA** : ≥ 7:1.

| Combinaison | Ratio | Statut | Action |
|---|---|---|---|
| `#0F172A` (texte) sur blanc | 18.1:1 | ✅ AAA | Usage libre |
| Blanc sur `#002D7A` (navy) | 9.0:1 | ✅ AAA | Usage libre |
| Blanc sur `#0A1F4D` (navy-dark) | 12.8:1 | ✅ AAA | Usage libre |
| `#002D7A` (navy) sur blanc | 9.0:1 | ✅ AAA | Bouton fond clair |
| `#FBB418` (or) sur `#0A1F4D` | 7.1:1 | ✅ AAA | Bouton doré sur navy ✓ |
| `#FBB418` (or) sur `#002D7A` | 6.5:1 | ✅ AA | Acceptable sur navy |
| `#002D7A` sur `#FBB418` | 6.5:1 | ✅ AA | Texte navy sur fond doré |
| `#DC2626` (rouge) sur blanc | 4.83:1 | ✅ AA | Usage erreur/danger OK |
| `#047857` (vert texte clair) sur blanc | 5.48:1 | ✅ AA | Vert de marque sur fond clair |
| `#16A34A` (status-ok) sur blanc | 4.54:1 | ✅ AA | Statut OK uniquement sur fond clair |
| `#10B982` (vert teal) sur blanc | 2.54:1 | ❌ ÉCHEC | **INTERDIT** en texte sur blanc |
| Blanc sur `#10B982` | 2.54:1 | ❌ ÉCHEC | **INTERDIT** — utiliser `#0F172A` (7.04:1) |
| `#FBB418` (or) sur blanc | 1.80:1 | ❌ ÉCHEC | **INTERDIT** — or sur navy uniquement |
| `#64748B` (muted) sur blanc | 4.76:1 | ✅ AA | Métadonnées acceptables |

**Combinaisons interdites à bannir du code** :
- `color: #10B982` sur fond blanc ou clair
- `background: #FBB418` sur fond blanc (bouton doré sur `--ny-background`)
- `color: #FBB418` sur fond blanc

---

### C. Statuts budgétaires — Tokens sémantiques

> Le vert de statut est **distinct** du vert de marque (`--ny-secondary` #047857 / #10B982).

| Token | Valeur | Ratio sur blanc | Usage |
|---|---|---|---|
| `--ny-status-ok` | `#16A34A` | 4.54:1 ✅ AA | Solde normal, dépense validée |
| `--ny-on-status-ok` | `#FFFFFF` | sur `#16A34A` : 4.54:1 ✅ | Texte blanc sur pastille verte |
| `--ny-status-ok-bg` | `#DCFCE7` | fond pastille — pas de texte blanc | Fond pastille état normal |
| `--ny-status-warning` | `#D97706` | 3.0:1 (grand texte) | Attention, budget proche limite |
| `--ny-on-status-warning` | `#FFFFFF` | sur `#D97706` : 3.0:1 (AA grand texte) | Texte pastille warning |
| `--ny-status-warning-bg` | `#FEF3C7` | fond pastille | Fond pastille attention |
| `--ny-status-danger` | `#DC2626` | 4.83:1 ✅ AA | Budget dépassé, critique |
| `--ny-on-status-danger` | `#FFFFFF` | sur `#DC2626` : 4.83:1 ✅ | Texte pastille danger |
| `--ny-status-danger-bg` | `#FEE2E2` | fond pastille | Fond pastille danger |

---

### D. Polices locales NyeGa

| Rôle | Famille | Fichiers woff2 requis |
|---|---|---|
| Titres | **Nunito** | `Nunito-Bold.woff2`, `Nunito-Regular.woff2` |
| Corps | **DM Sans** | `DMSans-Medium.woff2`, `DMSans-Regular.woff2` |

Chargés via `@font-face` dans `nyega-theme.css`. Fallbacks : `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.

> **⚠️ Fichiers absents du dépôt** : les 4 fichiers `.woff2` ci-dessus doivent être téléchargés et ajoutés à `nyega-web/fonts/` (sous-ensemble latin uniquement pour réduire le poids).
> Sources : [Google Fonts — Nunito](https://fonts.google.com/specimen/Nunito) / [DM Sans](https://fonts.google.com/specimen/DM+Sans) → télécharger "Download family" → extraire les `.woff2` latin.
> **L'`@import Google Fonts`** du template est retiré. Aucun CDN de polices en production.

---

### E. Composants applicatifs absents du template VaultEdge

Ces composants suivent les conventions `.ve-` / `.single-` de VaultEdge (rayon 12 px, ombres identiques, hover `translateY`), mais préfixés `.ny-`.

| Classe | Description |
|---|---|
| `.ny-screen` | Conteneur de vue SPA (une seule visible via `.active`) |
| `.ny-budget-hero-card` | Carte principale budget restant + statut (fond `--ny-primary-dark`) |
| `.ny-budget-remaining-amount` | Montant héros (32–40 px responsive, Nunito 900) |
| `.ny-status-pill` | Pastille statut budget (tokens statuts C) |
| `.ny-progress-wrap` | Conteneur jauge de consommation |
| `.ny-progress-bar-bg` | Fond gris de la jauge |
| `.ny-progress-bar-fill` | Remplissage coloré de la jauge |
| `.ny-daily-card` | Carte budget journalier recommandé |
| `.ny-expense-list` | Liste des dépenses |
| `.ny-expense-item` | Ligne de dépense (icône + texte + montant) |
| `.ny-quick-chip` | Bouton montant rapide (+100F, +500F…) |
| `.ny-auto-category-box` | Bloc catégorisation automatique |
| `.ny-auto-category-pill` | Pastille catégorie détectée (modifiable 1-tap) |
| `.ny-pill-source-badge` | Badge "auto" / "ia" / "règle" |
| `.ny-1tap-popover` | Modale bottom-sheet catégorie 1-tap |
| `.ny-1tap-grid` | Grille des 7 catégories togolaises |
| `.ny-stat-box` | Boîte statistique (écran analyse) |
| `.ny-breakdown-table` | Tableau détaillé par catégorie |
| `.ny-analytics-grid` | Layout 2 colonnes écran analyse |
| `.ny-bottom-nav` | Barre navigation bas mobile (Flutter-style) |
| `.ny-bottom-tab` | Onglet de la navigation bas |
| `.ny-tab-add` | Onglet "Ajouter" avec bulle saillante |
| `.ny-add-icon-bubble` | Bulle ronde flottante bouton "+" |
| `.ny-desktop-nav` | Sidebar de navigation latérale fixe (>1024px) |
| `.ny-modal-backdrop` | Fond semi-transparent de modale |
| `.ny-modal-box` | Boîte de dialogue modale |
| `.ny-modal-handle` | Poignée de drag bottom-sheet |
| `.ny-toast` | Notification toast flottante |
| `.ny-history-filters` | Barre de filtres historique |
| `.ny-filter-select` | Groupe filtre (label + select) |
| `.ny-home-grid` | Grille 2 colonnes écran accueil |
| `.ny-card` | Carte application générique |
| `.ny-card-header` | En-tête de carte (titre + action) |
| `.ny-card-title` | Titre de carte (Nunito 800, 18 px) |
| `.ny-form-group` | Groupe champ de formulaire |
| `.ny-form-control` | Champ input/select (style VaultEdge adapté) |
| `.ny-input-amount` | Input montant héros (32–40 px responsive, centré) |
| `.ny-btn` | Bouton de base NyeGa |
| `.ny-btn-primary` | Bouton principal (bg `--ny-primary`) |
| `.ny-btn-secondary` | Bouton accent (bg `--ny-secondary`) |
| `.ny-btn-outline` | Bouton contour |
| `.ny-btn-block` | Bouton pleine largeur |
| `.ny-btn-sm` | Bouton taille réduite |
| `.ny-auth-wrapper` | Fond page auth (gradient) |
| `.ny-auth-card` | Carte d'authentification (max-width 440px) |
| `.ny-auth-logo-wrap` | Bloc logo (auth uniquement) |
| `.ny-auth-tabs` | Onglets Connexion / Inscription |
| `.ny-auth-tab` | Onglet individuel |
| `.ny-auth-subtitle` | Tagline sous le logo |
| `.ny-alert` | Bloc alerte erreur/succès |
| `.ny-user-chip` | Chip utilisateur (avatar + nom) dans header |
| `.ny-user-avatar` | Avatar texte (initiale) |
| `.ny-btn-logout` | Bouton déconnexion header |
| `.ny-modal-quick-chips` | Chips montants rapides dans modale onboarding |

---

### F. Règles mobile-first NyeGa

| Point de rupture | Comportement |
|---|---|
| `< 375px` | App utilisable, paddings réduits à 12px |
| `375–767px` | Bottom nav visible, header compact, grille 1 col |
| `768–1024px` | Layout tablette, max-width 780px centré, bottom nav maintenue |
| `> 1024px` | Sidebar latérale fixe 260px, bottom nav masquée, contenu `margin-left: 260px` |

---

### G. Dépendances — Ce que NyeGa n'embarque PAS du template

| Élément template | Statut | Alternative légère |
|---|---|---|
| Bootstrap complet | ❌ Non copié | Grid Bootstrap 4 seul (`bootstrap.min.css`) |
| `animate.css` | ❌ Non copié | Transitions CSS custom via `--ny-transition` |
| jQuery complet | ❌ Non embarqué comme dépendance design | Vanilla JS dans `app.js` / `auth.js` |
| Photos / images démo | ❌ Non copiées | Logo NyeGa uniquement (`img/logo/`) |
| Google Fonts CDN | ❌ Retiré | `@font-face` local dans `nyega-theme.css` |

---

### H. Licences tierces — THIRD_PARTY_NOTICES.md

Le fichier [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) liste les composants tiers utilisés, notamment :

- **VaultEdge 1.0.0** — Licence MIT — Copyright Rabina Vishwakarma — Distribué par ThemeWagon

Texte de la licence MIT (VaultEdge) :

```
MIT License

Copyright (c) Rabina Vishwakarma / ThemeWagon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

### I. États UI — Spécifications

Tous les composants interactifs doivent gérer les états suivants :

| État | Classe CSS / Sélecteur | Comportement |
|---|---|---|
| **Chargement** | `.ny-loading` / `[aria-busy="true"]` | Skeleton shimmer ou spinner doré sur fond navy ; bouton désactivé avec `cursor: wait` |
| **Erreur** | `.ny-error` / `[aria-invalid="true"]` | Bordure `--ny-danger`, icône ⚠, message texte `#DC2626` (4.83:1 ✓) |
| **Vide** | `.ny-empty-state` | Illustration/icône neutre + message d'action, pas de fond coloré |
| **Désactivé** | `[disabled]` / `.ny-disabled` | `opacity: 0.45`, `cursor: not-allowed`, `pointer-events: none` ; pas de changement de couleur de fond |
| **Focus visible** | `:focus-visible` | `outline: 2px solid --ny-tertiary` (#FBB418), `outline-offset: 2px` — jamais `outline: none` sans alternative |

> **Règle accessibilité** : `:focus-visible` est obligatoire sur tous les éléments interactifs (boutons, liens, inputs, chips). Ne jamais supprimer le focus sans substitut visible.

---

### J. Architecture CSS NyeGa

```
nyega-web/css/
├── bootstrap.min.css      — Grid + utilitaires Bootstrap 4
├── font-awesome.min.css   — Icônes
├── nyega-theme.css        — Variables tokens + @font-face locaux + rétro-compat --ve-*
├── nyega-app.css          — Styles applicatifs (layout, header, nav, cartes)
└── nyega-refonte.css      — Couche raffinement (typographie, spacing, composants)
```

> **Règle absolue** : aucune couleur hors token dans `nyega-app.css` et `nyega-refonte.css`. Toutes les valeurs passent par `--ny-*` définis dans `nyega-theme.css`. Les `id`, classes et attributs utilisés par le JS ne sont jamais modifiés.
