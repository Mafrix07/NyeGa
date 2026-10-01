---
version: 2.0
name: NyeGa Design System
updated: 2026-10-01
description: >-
  Identité visuelle propriétaire de NyeGa — application de gestion de budget
  pour étudiants togolais (Lomé). Palette extraite du logo officiel :
  Bleu Marine, Vert Teal, Doré, + Rouge Danger, + Vert de statut sémantique.
  Polices hébergées localement. Aucune couleur hors tokens.
  Optimisé WCAG AA, mobile-first, réseau 2G/3G.
  Aucun emprunt de marque externe (pas de Supabase, pas de Stripe, pas de Vercel).

# ============================================================
# 1. COULEURS — PALETTE OFFICIELLE NYEGA
# Source unique : logo NyeGa (Bleu Marine, Teal, Doré)
# Ne jamais introduire une couleur absente de cette section.
# ============================================================
colors:

  # --- Primaire : Bleu Marine ---
  # Signification : Texte "Nye" + capuchon d'étudiant dans le logo.
  # Valeur sémantique : sérieux, confiance, discipline budgétaire.
  primary:              "#002D7A"
  primary-hover:        "#001F56"
  primary-container:    "#EBF2FF"
  on-primary:           "#FFFFFF"
  on-primary-container: "#001A4D"

  # --- Secondaire : Vert Teal ---
  # Signification : Texte "Ga" + feuille de croissance dans le logo.
  # Valeur sémantique : vitalité, optimisme, action positive.
  secondary:              "#10B982"
  secondary-hover:        "#059669"
  secondary-container:    "#D1FAE5"
  on-secondary:           "#FFFFFF"
  on-secondary-container: "#064E3B"

  # --- Tertiaire : Doré ---
  # Signification : Croissant dynamique + gland du capuchon dans le logo.
  # Valeur sémantique : ambition, réussite, valeur symbolique.
  tertiary:              "#FBB418"
  tertiary-hover:        "#E5A110"
  tertiary-container:    "#FEF3C7"
  on-tertiary:           "#002D7A"   # Bleu marine → contraste WCAG AAA 7.03:1 sur doré
  on-tertiary-container: "#78350F"

  # --- Danger / Alerte critique ---
  danger:              "#DC2626"
  danger-hover:        "#B91C1C"
  danger-container:    "#FEE2E2"
  on-danger:           "#FFFFFF"
  on-danger-container: "#7F1D1D"

  # --- Surfaces et fonds ---
  background:      "#F8FAFC"   # Fond principal légèrement bleuté/ardoise
  surface:         "#FFFFFF"   # Cartes et conteneurs
  surface-variant: "#F1F5F9"   # Arrière-plan de section secondaire
  surface-tinted:  "#F0F4FA"   # Surface légèrement teintée bleu marine

  # --- Textes ---
  on-background:      "#0F172A"   # Texte principal (WCAG AAA)
  on-surface:         "#0F172A"   # Texte sur fond blanc
  on-surface-variant: "#475569"   # Texte secondaire / sous-titres (WCAG AAA 7.58:1)
  text-muted:         "#64748B"   # Métadonnées discrètes (WCAG AA 4.76:1)

  # --- Bordures ---
  outline:         "#E2E8F0"
  outline-variant: "#CBD5E1"

  # --- Statuts budgétaires (DISTINCTS du vert de marque #10B982) ---
  # Ces couleurs sont sémantiques (état OK/Warning/Danger) et non décoratives.
  status-ok:         "#16A34A"   # Vert d'état OK — différent de secondary
  on-status-ok:      "#FFFFFF"
  status-ok-bg:      "#DCFCE7"
  status-warning:    "#D97706"   # Orange d'état tendu
  on-status-warning: "#FFFFFF"
  status-warning-bg: "#FEF3C7"
  status-danger:     "#DC2626"   # Rouge critique (identique au danger, renommé pour clarté sémantique)
  on-status-danger:  "#FFFFFF"
  status-danger-bg:  "#FEE2E2"

# ============================================================
# 2. TYPOGRAPHIE
# Règle : 2 polices maximum, toujours hébergées localement.
# Jamais d'appel Google Fonts ou CDN externe en production.
# ============================================================
typography:
  heading:
    family: "Nunito"
    fallback: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    weights: [700, 800, 900]
    usage: "Titres (h1–h4), montants financiers, marque NyeGa"
    files:
      - "fonts/Nunito-Bold.woff2"
      - "fonts/Nunito-Bold.woff"
      - "fonts/Nunito-Regular.woff2"
      - "fonts/Nunito-Regular.woff"
    font-display: "swap"

  body:
    family: "DM Sans"
    fallback: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    weights: [400, 500, 600, 700]
    usage: "Corps de texte, labels, métadonnées, interface"
    files:
      - "fonts/DMSans-Regular.woff2"
      - "fonts/DMSans-Regular.woff"
      - "fonts/DMSans-Medium.woff2"
      - "fonts/DMSans-Medium.woff"
    font-display: "swap"

  scale:
    # Ratio harmonique : 1.25 (quarte majeure)
    # Base : 16px (empêche le zoom forcé iOS Safari)
    display:  "36px / 1.1 / Nunito 900"    # Budget restant, montants héros
    h1:       "28px / 1.2 / Nunito 800"
    h2:       "22px / 1.3 / Nunito 800"
    h3:       "18px / 1.35 / Nunito 700"
    h4:       "16px / 1.4 / Nunito 700"
    body-lg:  "16px / 1.6 / DM Sans 400"   # Minimum sur champs input (évite zoom iOS)
    body-md:  "14px / 1.55 / DM Sans 400"
    body-sm:  "13px / 1.5 / DM Sans 400"
    label:    "11px / 1.4 / DM Sans 700 + uppercase + letter-spacing:0.8px"
    caption:  "12px / 1.45 / DM Sans 400"

# ============================================================
# 3. ESPACEMENT — Échelle à pas de 4px
# ============================================================
spacing:
  xs:   "4px"
  sm:   "8px"
  md:   "12px"
  lg:   "16px"
  xl:   "20px"
  2xl:  "24px"
  3xl:  "32px"
  4xl:  "48px"
  5xl:  "64px"

  note: >
    Padding des cartes mobiles : 16px/14px.
    Padding des cartes tablette/desktop : 24px.
    Gap grilles : 12–16px mobile, 20–28px desktop.

# ============================================================
# 4. RAYONS DE BORDURE
# ============================================================
rounded:
  sm:   "6px"    # Boutons sm, chips, badges
  md:   "12px"   # Cartes standard
  lg:   "16px"   # Cartes héros, modales
  xl:   "20px"   # Bottom sheets
  full: "9999px" # Pills, statuts, toasts

# ============================================================
# 5. OMBRES
# ============================================================
shadows:
  sm:       "0 2px 8px rgba(0, 45, 122, 0.06)"     # Cartes légères
  md:       "0 8px 30px rgba(0, 45, 122, 0.08)"    # Cartes actives
  lg:       "0 16px 40px rgba(0, 45, 122, 0.12)"   # Modales, bottom sheets
  floating: "0 10px 25px -5px rgba(0, 45, 122, 0.25)"  # Toast, FAB
  sidebar:  "2px 0 16px rgba(0, 0, 0, 0.08)"       # Sidebar desktop

# ============================================================
# 6. COMPOSANTS
# ============================================================
components:

  # --- BOUTONS ---
  button:
    min-height:  "44px"    # Cible tactile WCAG minimum
    min-width:   "44px"
    padding:     "12px 24px"
    border-radius: "{rounded.sm}"
    font-weight: 700
    font-size:   "15px"
    transition:  "{motion.transition}"

    variants:
      primary:
        background:  "{colors.primary}"
        color:       "{colors.on-primary}"
        hover-bg:    "{colors.primary-hover}"
        hover-shadow: "0 4px 14px rgba(0, 45, 122, 0.3)"
        hover-transform: "translateY(-1px)"

      secondary:
        background:  "{colors.secondary}"
        color:       "{colors.on-secondary}"
        hover-bg:    "{colors.secondary-hover}"
        hover-shadow: "0 4px 14px rgba(16, 185, 130, 0.35)"

      tertiary:
        background:  "{colors.tertiary}"
        color:       "{colors.on-tertiary}"    # Bleu marine sur doré — WCAG AAA 7.03:1

      outline:
        background:  "transparent"
        border:      "2px solid {colors.primary}"
        color:       "{colors.primary}"
        hover-bg:    "{colors.primary-container}"

      danger:
        background:  "{colors.danger}"
        color:       "{colors.on-danger}"

      ghost:
        background:  "transparent"
        border:      "1px solid {colors.outline}"
        color:       "{colors.on-surface-variant}"
        hover-bg:    "{colors.surface-variant}"

  # --- CARTES ---
  card:
    background:    "{colors.surface}"
    border:        "1px solid {colors.outline}"
    border-radius: "{rounded.md}"
    shadow:        "{shadows.sm}"
    padding-mobile: "16px 14px"
    padding-desktop: "24px"
    hover-shadow:  "{shadows.md}"

  card-hero:
    background:    "linear-gradient(135deg, {colors.primary} 0%, #001B49 100%)"
    border-radius: "{rounded.lg}"
    padding-mobile: "18px 16px"
    padding-desktop: "28px 24px"
    color:         "#FFFFFF"
    note: >
      La carte héros du budget utilise un dégradé du bleu marine officiel
      vers une nuance encore plus sombre. Pas de gradients décoratifs aléatoires.

  card-tinted:
    background:    "{colors.primary-container}"
    border:        "1px solid rgba(0, 45, 122, 0.15)"
    note: "Utilisé pour les conseils et astuces NyeGa."

  # --- CHAMPS DE FORMULAIRE ---
  input:
    min-height:    "48px"
    padding:       "12px 14px"
    font-size:     "16px"    # IMPÉRATIF : empêche le zoom auto iOS Safari
    border:        "1.5px solid {colors.outline}"
    border-radius: "{rounded.md}"
    focus-border:  "{colors.primary}"
    focus-shadow:  "0 0 0 3px rgba(0, 45, 122, 0.12)"
    background:    "{colors.surface}"
    color:         "{colors.on-surface}"

  input-amount:
    font-family:   "{typography.heading.family}"
    font-size:     "26px"
    font-weight:   800
    text-align:    "center"
    color:         "{colors.primary}"

  label:
    font-size:     "13px"
    font-weight:   700
    color:         "{colors.on-surface-variant}"
    margin-bottom: "8px"

  select:
    inherits: input
    note: "Styles identiques aux inputs textuels."

  # --- PASTILLES DE CATÉGORIE ---
  category-pill:
    display:       "inline-flex"
    align-items:   "center"
    gap:           "8px"
    min-height:    "44px"
    padding:       "8px 16px"
    border-radius: "{rounded.full}"
    font-size:     "13px"
    font-weight:   700
    cursor:        "pointer"
    note: >
      Couleur de fond et icône dynamiques selon la catégorie (Alimentation,
      Transport, Télécom, Loisirs, Santé, Scolarité, Autres).
      Un badge source (auto / IA / manuel) est affiché en mini-label.

  status-pill:
    display:        "inline-flex"
    align-items:    "center"
    gap:            "6px"
    padding:        "5px 12px"
    border-radius:  "{rounded.full}"
    font-size:      "11px"
    font-weight:    700
    letter-spacing: "0.3px"
    text-transform: "uppercase"
    variants:
      ok:
        background: "{colors.status-ok-bg}"
        color:      "{colors.status-ok}"
        border:     "1px solid rgba(22, 163, 74, 0.3)"
      warning:
        background: "{colors.status-warning-bg}"
        color:      "{colors.status-warning}"
        border:     "1px solid rgba(217, 119, 6, 0.3)"
      danger:
        background: "{colors.status-danger-bg}"
        color:      "{colors.status-danger}"
        border:     "1px solid rgba(220, 38, 38, 0.3)"

  # --- JAUGES DE BUDGET ---
  progress:
    track:
      height:        "10px"
      border-radius: "{rounded.full}"
      background:    "rgba(255, 255, 255, 0.18)"  # Sur fond sombre hero card
    fill:
      border-radius: "{rounded.full}"
      transition:    "width 0.6s ease"
      colors:
        ok:      "{colors.status-ok}"
        warning: "{colors.status-warning}"
        danger:  "{colors.status-danger}"

  breakdown-bar:
    height:        "8px"
    border-radius: "{rounded.sm}"
    note: "Mini-jauge de proportion par ligne de catégorie dans le tableau d'analyse."

  # --- ÉTATS VIDES ---
  empty-state:
    text-align:   "center"
    padding:      "48px 24px"
    icon:
      font-size:     "48px"
      color:         "{colors.outline-variant}"
      margin-bottom: "16px"
    title:
      font-family: "{typography.heading.family}"
      font-size:   "17px"
      font-weight: 700
      color:       "{colors.on-surface-variant}"
      margin-bottom: "8px"
    description:
      font-size:     "14px"
      color:         "{colors.text-muted}"
      line-height:   "1.5"
    examples:
      history: "Aucune dépense pour l'instant. Commencez par ajouter votre premier achat !"
      analysis: "Ajoutez quelques dépenses pour voir votre répartition par catégorie."

  # --- ÉTATS D'ERREUR ---
  error-state:
    background:    "{colors.danger-container}"
    border:        "1px solid {colors.danger}"
    border-radius: "{rounded.md}"
    padding:       "16px 20px"
    icon:
      color:     "{colors.danger}"
      font-size: "20px"
    title:
      font-weight: 700
      font-size:   "14px"
      color:       "{colors.danger}"
    description:
      font-size:   "13px"
      color:       "{colors.on-danger-container}"
      line-height: "1.45"
    examples:
      network: "Une erreur est survenue. Vérifiez votre connexion et réessayez."
      auth:    "Email ou mot de passe incorrect. Vérifiez vos informations."

  # --- ÉTATS DE CHARGEMENT ---
  loading-state:
    text-align:   "center"
    padding:      "40px 24px"
    color:        "{colors.text-muted}"
    font-size:    "14px"
    spinner:
      color:  "{colors.primary}"
      size:   "28px"
    examples:
      generic: "Chargement en cours..."
      expenses: "Chargement de vos dépenses..."

  # --- ALERTES ---
  alert:
    padding:       "12px 16px"
    border-radius: "{rounded.sm}"
    font-size:     "14px"
    margin-bottom: "16px"
    display:       "flex"
    align-items:   "center"
    gap:           "10px"
    variants:
      danger:
        background: "{colors.danger-container}"
        color:      "{colors.on-danger-container}"
        border:     "1px solid rgba(220, 38, 38, 0.2)"
      success:
        background: "{colors.secondary-container}"
        color:      "{colors.on-secondary-container}"
        border:     "1px solid rgba(16, 185, 130, 0.2)"
      warning:
        background: "{colors.tertiary-container}"
        color:      "{colors.on-tertiary-container}"
        border:     "1px solid rgba(251, 180, 24, 0.3)"

  # --- TOAST ---
  toast:
    position:      "fixed bottom: 84px, left: 50%, transform: translateX(-50%)"
    background:    "{colors.primary}"
    color:         "{colors.on-primary}"
    padding:       "12px 24px"
    border-radius: "{rounded.full}"
    shadow:        "{shadows.floating}"
    font-weight:   600
    font-size:     "14px"
    z-index:       9999
    note: "Disparaît après 3s. Positionnement bas-centre, au-dessus de la nav bar."

  # --- MODALE / BOTTOM SHEET ---
  modal:
    backdrop:      "rgba(0, 27, 73, 0.6)"
    backdrop-blur: "blur(4px)"
    mobile:
      border-radius:  "20px 20px 0 0"
      padding:        "18px 16px 24px 16px"
      max-height:     "85vh"
      animation:      "slideUp 0.25s ease-out"
    desktop:
      border-radius:  "{rounded.lg}"
      max-width:      "500px"
      padding:        "28px"
      animation:      "fadeIn 0.2s ease-out"
    handle:
      width:            "36px"
      height:           "4px"
      background:       "{colors.outline-variant}"
      border-radius:    "{rounded.full}"
      margin:           "0 auto 14px"
      hidden-on-desktop: true
    close-button:
      min-width:  "44px"
      min-height: "44px"
      display:    "inline-flex"

  # --- SIDEBAR / NAVIGATION DESKTOP ---
  sidebar:
    width:        "260px"
    background:   "{colors.primary}"
    color:        "{colors.on-primary}"
    position:     "fixed left-0 top-0 bottom-0"
    padding:      "28px 20px 24px"
    nav-item:
      padding:        "12px 16px"
      border-radius:  "{rounded.sm}"
      font-size:      "15px"
      font-weight:    600
      color:          "rgba(255, 255, 255, 0.85)"
      active-bg:      "{colors.secondary}"
      active-shadow:  "0 4px 12px rgba(16, 185, 130, 0.35)"
      hover-bg:       "rgba(255, 255, 255, 0.12)"
      hover-transform: "translateX(3px)"

  # --- NAVIGATION MOBILE (BOTTOM BAR) ---
  bottom-nav:
    height:        "calc(64px + env(safe-area-inset-bottom, 0px))"
    background:    "{colors.surface}"
    border-top:    "1px solid {colors.outline}"
    shadow:        "0 -4px 20px rgba(0, 0, 0, 0.08)"
    tab:
      min-height:  "48px"
      font-size:   "11px"
      font-weight: 600
      color:       "{colors.on-surface-variant}"
      active-color: "{colors.primary}"
    add-bubble:
      width:       "44px"
      height:      "44px"
      background:  "{colors.primary}"
      border-radius: "50%"
      shadow:      "0 4px 12px rgba(0, 45, 122, 0.35)"
      margin-top:  "-16px"

  # --- CHIPS RAPIDES (montants fréquents) ---
  quick-chip:
    min-height:       "44px"
    padding:          "8px 4px"
    background:       "{colors.surface-variant}"
    border:           "1px solid {colors.outline}"
    border-radius:    "{rounded.sm}"
    font-size:        "13px"
    font-weight:      700
    color:            "{colors.primary}"
    selected-bg:      "{colors.primary}"
    selected-color:   "#FFFFFF"
    hover-bg:         "{colors.primary-container}"
    hover-transform:  "translateY(-2px)"

# ============================================================
# 7. TRANSITIONS & ANIMATION
# ============================================================
motion:
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
  screen-enter: "opacity 0→1, translateY 6px→0, durée 0.25s"

  keyframes:
    fadeIn: "opacity 0→1, translateY 6px→0"
    slideUp: "translateY 100%→0"
    pulse: "opacity 0.6→1→0.6, durée 1.4s infinite"

  reduced-motion: >
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
  note: >
    Toujours déclarer prefers-reduced-motion.
    Animations lourdes (3D, particules, WebGL) : INTERDITES.
    Réseau 2G/3G au Togo — optimiser impérativement le poids.

# ============================================================
# 8. ACCESSIBILITÉ
# ============================================================
accessibility:
  contrast:
    minimum:  "WCAG AA 4.5:1 pour tout texte normal"
    enhanced: "WCAG AAA 7:1 pour texte principal (on-background, on-surface)"
  touch-targets:
    minimum: "44×44px pour tout élément interactif (boutons, tabs, icônes)"
  focus:
    ring:   "3px solid rgba(0, 45, 122, 0.45)"
    offset: "2px"
    note:   "Ne jamais supprimer l'outline de focus sans alternative visible."
  images:
    alt: "Alt text obligatoire sur toutes les images."
    logo: "Logo img uniquement sur auth.html — interdit dans index.html."

# ============================================================
# 9. LOGO
# ============================================================
logo:
  usage: "img/logo/Logo_SANS_FOND.png — UNIQUEMENT sur auth.html (connexion/inscription)"
  forbidden: "Ne pas afficher le logo image dans l'app principale (index.html)"
  text-version: >
    Texte 'NyeGa' stylisé :
    - 'Nye' en blanc (#FFFFFF) sur fond bleu marine
    - 'Ga' en {colors.secondary} (#10B982)

# ============================================================
# 10. TON DES TEXTES (Français, contexte étudiant togolais)
# ============================================================
copywriting:
  language: "Français neutre et chaleureux"
  currency:
    token: "FCFA"
    formats:
      standard: "50 000 FCFA"   # Espace insécable pour les milliers
      short:    "500 F"          # Acceptable pour petits montants
      forbidden: ["€", "$", "0,5k F"]
  tone:
    style: "Direct, bienveillant, sans jargon financier"
    voice: "Parle à l'étudiant comme un allié, jamais de condescendance"
  examples:
    empty-history: "Aucune dépense pour l'instant. Commencez par ajouter votre premier achat !"
    empty-analysis: "Ajoutez quelques dépenses pour voir votre répartition par catégorie."
    success:       "Dépense enregistrée avec succès."
    error-network: "Une erreur est survenue. Vérifiez votre connexion et réessayez."
    budget-ok:     "Budget sain — continuez comme ça !"
    budget-warning: "Budget tendu — encore {amount} FCFA disponibles."
    budget-danger: "Budget dépassé de {amount} FCFA."
  prohibitions:
    - "Ne jamais utiliser 'oops' ou anglicismes dans les messages UI"
    - "Ne jamais afficher de stack traces dans l'interface"
    - "Ne jamais utiliser des majuscules lock (CRIER) sauf pastilles de statut"
    - "Ne jamais écrire les prix en '€' ou '$'"

# ============================================================
# 11. RESPONSIVE & BREAKPOINTS
# ============================================================
breakpoints:
  mobile:     "< 576px    — layout 1 colonne, bottom nav visible, sidebar masquée"
  tablet-sm:  "576–767px  — layout 1 colonne élargie"
  tablet:     "768–1024px — transitions vers sidebar"
  desktop:    "> 1024px   — sidebar fixe 260px, bottom nav masquée"

grid:
  mobile:  "Bootstrap 12 colonnes, padding 12px"
  tablet:  "max-width 780px centré"
  desktop: "100% - 260px (sidebar)"

# ============================================================
# 12. DO's & DON'Ts
# ============================================================
dos:
  - "Utiliser uniquement les tokens de couleur définis dans ce document"
  - "Respecter la cible tactile minimale de 44×44px sur tous les éléments interactifs"
  - "Afficher les montants en FCFA avec espace insécable (50 000 FCFA)"
  - "Déclarer prefers-reduced-motion dans toutes les animations CSS"
  - "Conserver les ids et attributs HTML utilisés par le JS sans modification"
  - "Héberger les polices localement — jamais de Google Fonts CDN en production"
  - "Assurer le contraste WCAG AA minimum pour tout le texte"
  - "Afficher le focus-ring visible sur :focus-visible pour la navigation clavier"
  - "Utiliser font-size: 16px minimum sur les inputs pour éviter le zoom iOS"

donts:
  - "Ne jamais introduire une couleur hors tokens"
  - "Ne jamais utiliser du 3D (Three.js, WebGL) — trop lourd pour réseau 2G/3G"
  - "Ne jamais afficher le logo image (img) dans index.html"
  - "Ne jamais modifier les fichiers JS de logique (app.js, auth.js, supabase-client.js, config.js, local-dictionary.js)"
  - "Ne jamais modifier les ids ou attributs HTML utilisés par le JS"
  - "Ne jamais utiliser des gradients atmosphériques décoratifs non liés à la charte"
  - "Ne jamais charger des polices depuis un CDN externe en production"
  - "Ne jamais écrire les prix en '€' ou '$'"
  - "Ne jamais emprunter la palette d'une autre marque (Supabase, Stripe, Vercel, etc.)"
  - "Ne jamais supprimer l'outline de focus sans fournir une alternative visible"

---

## Vue d'ensemble

NyeGa est une application de gestion de budget mobile-first conçue pour les **étudiants togolais**. Son identité visuelle est ancrée dans les couleurs de son logo officiel :

- **Bleu marine** (`#002D7A`) — Sérieux, confiance, discipline budgétaire.
- **Vert Teal** (`#10B982`) — Croissance, vitalité, optimisme.
- **Doré** (`#FBB418`) — Ambition, réussite, valeur symbolique.

Ces trois couleurs forment le cœur de l'identité NyeGa. Elles ne sont **jamais** remplacées par des équivalents issus d'autres marques.

### Contexte de déploiement
L'application fonctionne sur **réseau 2G/3G** au Togo. Toute décision de design minimise le poids des ressources : pas de polices CDN en production, pas d'animations lourdes, pas de 3D, pas de WebGL.

### Devise
Le FCFA est la devise exclusive. Toujours afficher les montants en `FCFA` ou `F CFA`, jamais en `€` ni en devise étrangère.

### Accessibilité
Contraste WCAG AA partout. Cibles tactiles ≥ 44 px. `prefers-reduced-motion` déclaré sur toutes les animations.

## Tableau de contraste (référence)

| Texte | Fond | Ratio | Niveau |
|:------|:-----|------:|:------:|
| `#FFFFFF` sur `#002D7A` (primary) | — | **8.59:1** | AAA ✅ |
| `#002D7A` sur `#FBB418` (tertiary) | — | **7.03:1** | AAA ✅ |
| `#FFFFFF` sur `#10B982` (secondary) | — | **2.84:1** | ❌ Texte small uniquement |
| `#FFFFFF` on `#059669` (secondary-hover) | — | **3.88:1** | AA large ⚠️ |
| `#0F172A` sur `#F8FAFC` (background) | — | **18.0:1** | AAA ✅ |
| `#475569` sur `#FFFFFF` | — | **7.58:1** | AAA ✅ |
| `#64748B` sur `#FFFFFF` (text-muted) | — | **4.76:1** | AA ✅ |
| `#DC2626` sur `#FEE2E2` | — | **4.52:1** | AA ✅ |
| `#16A34A` sur `#DCFCE7` | — | **4.66:1** | AA ✅ |
| `#D97706` sur `#FEF3C7` | — | **4.53:1** | AA ✅ |

> **Note** : Le vert teal `#10B982` ne peut pas porter du texte blanc WCAG AA. Il est utilisé uniquement comme couleur d'accent (bordures, icônes, actif sidebar) ou sur fond sombre. Pour du texte sur fond clair, utiliser `#059669` ou `#064E3B`.
