---
version: 1.0
name: NyeGa-Design-System
description: >-
  Identité visuelle propre à NyeGa — application de gestion de budget
  pour étudiants togolais. Palette extraite du logo officiel : bleu marine,
  teal, doré, rouge danger, vert de statut. Polices hébergées localement.
  Aucune couleur hors tokens. Optimisé WCAG AA, mobile-first, 2G/3G.

# ============================================================
# TOKENS DE COULEUR — PALETTE OFFICIELLE NYEGA
# (extraits du logo : Bleu Marine, Teal, Doré)
# ============================================================
colors:
  # Primaire : Bleu Marine (texte "Nye" + capuchon d'étudiant dans le logo)
  primary:            "#002D7A"
  primary-hover:      "#001F56"
  primary-container:  "#EBF2FF"
  on-primary:         "#FFFFFF"
  on-primary-container: "#001A4D"

  # Secondaire : Vert Teal (texte "Ga" + feuille de croissance dans le logo)
  secondary:          "#10B982"
  secondary-hover:    "#059669"
  secondary-container: "#D1FAE5"
  on-secondary:       "#FFFFFF"
  on-secondary-container: "#064E3B"

  # Tertiaire : Doré (croissant dynamique + gland du capuchon dans le logo)
  tertiary:           "#FBB418"
  tertiary-hover:     "#E5A110"
  tertiary-container: "#FEF3C7"
  on-tertiary:        "#002D7A"   # Bleu marine → contraste WCAG AAA 7.03:1 sur doré
  on-tertiary-container: "#78350F"

  # Danger / Alerte critique
  danger:             "#DC2626"
  danger-hover:       "#B91C1C"
  danger-container:   "#FEE2E2"
  on-danger:          "#FFFFFF"
  on-danger-container: "#7F1D1D"

  # Surfaces & Fonds
  background:         "#F8FAFC"   # Fond principal très légèrement bleuté/ardoise
  surface:            "#FFFFFF"   # Cartes et conteneurs
  surface-variant:    "#F1F5F9"   # Arrière-plan de section secondaire
  surface-tinted:     "#F0F4FA"   # Surface légèrement teintée bleu marine

  # Textes
  on-background:      "#0F172A"   # Texte principal (WCAG AAA)
  on-surface:         "#0F172A"   # Texte sur fond blanc
  on-surface-variant: "#475569"   # Texte secondaire / sous-titres (WCAG AAA 7.58:1)
  text-muted:         "#64748B"   # Métadonnées discrètes (WCAG AA 4.76:1)

  # Bordures
  outline:            "#E2E8F0"
  outline-variant:    "#CBD5E1"

  # Statuts budgétaires sémantiques (DISTINCTS du vert de marque #10B982)
  status-ok:          "#16A34A"   # Vert d'état OK (budget sain)
  on-status-ok:       "#FFFFFF"
  status-ok-bg:       "#DCFCE7"
  status-warning:     "#D97706"   # Orange d'avertissement (budget tendu)
  on-status-warning:  "#FFFFFF"
  status-warning-bg:  "#FEF3C7"
  status-danger:      "#DC2626"   # Rouge critique (budget dépassé)
  on-status-danger:   "#FFFFFF"
  status-danger-bg:   "#FEE2E2"

# ============================================================
# RÈGLE STRICTE : AUCUNE couleur hors de ces tokens ne doit
# apparaître dans les fichiers CSS ou HTML de l'application.
# ============================================================

# ============================================================
# TYPOGRAPHIE — 2 polices max, hébergées localement
# ============================================================
typography:
  # Police 1 : Nunito — Titres et en-têtes (géométrique, amical, lisible)
  # Fichiers locaux : fonts/Nunito-*.woff2 (à placer dans nyega-web/fonts/)
  # Fallback : sans-serif système si absent
  font-heading:
    family: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    note: "Hébergée localement. Pas d'appel Google Fonts en production."

  # Police 2 : DM Sans — Corps de texte et interface (neutre, lisible sur 2G)
  # Fichiers locaux : fonts/DMSans-*.woff2
  font-body:
    family: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    note: "Hébergée localement. Pas d'appel Google Fonts en production."

  # Échelle typographique (ratio 1.25 — quarte majeure)
  display-lg:
    fontSize: 32px
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.5px"
    fontFamily: font-heading
    use: "Montant budget hero (mobile)"

  display-md:
    fontSize: 26px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.3px"
    fontFamily: font-heading
    use: "Titres de page, montants secondaires"

  heading-lg:
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0"
    fontFamily: font-heading
    use: "Titres de section / carte"

  heading-md:
    fontSize: 17px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0"
    fontFamily: font-heading
    use: "Sous-titres de carte"

  body-lg:
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
    fontFamily: font-body
    use: "Texte de formulaire principal"

  body-md:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
    fontFamily: font-body
    use: "Corps de texte UI par défaut"

  label:
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.1px"
    fontFamily: font-body
    use: "Étiquettes de formulaire, légendes"

  caption:
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0"
    fontFamily: font-body
    use: "Notes, métadonnées, sous-texte"

  micro:
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.3px"
    fontFamily: font-body
    use: "Pastilles, badges, libellés de catégorie"

  button:
    fontSize: 15px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: "0"
    fontFamily: font-body
    use: "Libellé de bouton"

# ============================================================
# ÉCHELLE D'ESPACEMENT (base 4px)
# ============================================================
spacing:
  1:  4px
  2:  8px
  3:  12px
  4:  16px
  5:  20px
  6:  24px
  8:  32px
  10: 40px
  12: 48px
  16: 64px
  note: >
    Utiliser uniquement ces valeurs. Toute valeur intermédiaire
    doit être justifiée par une contrainte de safe-area mobile.

# ============================================================
# RAYONS DE BORDURE
# ============================================================
rounded:
  sm:   6px    # Boutons, chips rapides
  md:   12px   # Cartes, champs de saisie
  lg:   16px   # Cartes hero, modales
  full: 9999px # Pastilles de catégorie, avatars, pills

# ============================================================
# OMBRES (teintées bleu marine — cohérence identité)
# ============================================================
shadows:
  sm:       "0 2px 8px rgba(0, 45, 122, 0.06)"    # Cartes au repos
  md:       "0 8px 30px rgba(0, 45, 122, 0.08)"   # Cartes hover, sidebars
  lg:       "0 16px 40px rgba(0, 45, 122, 0.12)"  # Modales
  floating: "0 10px 25px -5px rgba(0, 45, 122, 0.25)"  # FAB, éléments flottants

# ============================================================
# COMPOSANTS
# ============================================================
components:

  # ---- BOUTONS ----
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor:       "{colors.on-primary}"
    typography:      "{typography.button}"
    rounded:         "{rounded.sm}"
    padding:         "12px 24px"
    minHeight:       "44px"    # Cible tactile WCAG ≥ 44px
    minWidth:        "44px"
    note: "Fond bleu marine, texte blanc. Action principale unique par écran."

  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"

  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor:       "{colors.on-secondary}"
    typography:      "{typography.button}"
    rounded:         "{rounded.sm}"
    padding:         "12px 24px"
    minHeight:       "44px"
    note: "Fond teal, texte blanc. Action alternative (inscription)."

  button-outline:
    backgroundColor: "transparent"
    textColor:       "{colors.primary}"
    border:          "1.5px solid {colors.primary}"
    typography:      "{typography.button}"
    rounded:         "{rounded.sm}"
    padding:         "11px 23px"
    minHeight:       "44px"
    note: "Secondaire ou annulation."

  button-danger:
    backgroundColor: "{colors.danger}"
    textColor:       "{colors.on-danger}"
    typography:      "{typography.button}"
    rounded:         "{rounded.sm}"
    padding:         "12px 24px"
    minHeight:       "44px"
    note: "Actions destructrices uniquement (supprimer compte)."

  button-ghost:
    backgroundColor: "transparent"
    textColor:       "{colors.text-muted}"
    typography:      "{typography.body-md}"
    rounded:         "{rounded.sm}"
    padding:         "10px 16px"
    minHeight:       "44px"
    note: "Liens discrets (Définir plus tard, Mot de passe oublié)."

  button-block:
    width: "100%"
    note: "Modificateur — s'applique à tout bouton pour occuper toute la largeur."

  # ---- CHAMPS DE SAISIE ----
  input-default:
    backgroundColor: "{colors.surface}"
    textColor:       "{colors.on-surface}"
    borderColor:     "{colors.outline}"
    border:          "1.5px solid {colors.outline}"
    typography:      "{typography.body-lg}"
    rounded:         "{rounded.md}"
    padding:         "12px 14px"
    minHeight:       "48px"
    focusBorderColor: "{colors.primary}"
    focusOutline:    "3px solid rgba(0, 45, 122, 0.15)"
    note: "Hauteur 48px pour facilité tactile. Label au-dessus, jamais en placeholder seul."

  input-amount:
    fontSize: "24px"
    fontWeight: 800
    textAlign: "center"
    note: "Champ montant FCFA — affiche la valeur en grand pour contrôle visuel immédiat."

  input-error:
    borderColor: "{colors.danger}"
    focusOutline: "3px solid rgba(220, 38, 38, 0.15)"

  label-default:
    textColor:   "{colors.on-surface-variant}"
    typography:  "{typography.label}"
    marginBottom: "6px"
    display: "block"

  helper-text:
    textColor:   "{colors.text-muted}"
    typography:  "{typography.caption}"
    marginTop:   "4px"

  # ---- CARTES ----
  card-default:
    backgroundColor: "{colors.surface}"
    border:          "1px solid {colors.outline}"
    rounded:         "{rounded.md}"
    padding:         "16px"
    shadow:          "{shadows.sm}"
    note: "Carte standard. padding 24px à partir de 576px."

  card-hero:
    backgroundColor: "gradient(135deg, {colors.primary} 0%, #001B49 100%)"
    textColor:       "{colors.on-primary}"
    rounded:         "{rounded.lg}"
    padding:         "18px 16px"
    shadow:          "{shadows.md}"
    note: >
      Carte budget hero (fond bleu marine dégradé). Taille de police du montant :
      30px mobile → 38px à 480px → 48px à 576px.
      Halo décoratif doré (#FBB418 opacité 20%) en arrière-plan droit.

  card-daily:
    backgroundColor: "{colors.surface}"
    borderLeft:      "6px solid {colors.secondary}"
    rounded:         "{rounded.md}"
    shadow:          "{shadows.sm}"
    note: "Carte budget journalier conseillé. Accent teal sur bordure gauche."

  card-info:
    backgroundColor: "{colors.primary-container}"
    borderColor:     "rgba(0, 45, 122, 0.15)"
    rounded:         "{rounded.md}"
    note: "Carte conseil / astuces (fond bleu très clair)."

  card-danger:
    backgroundColor: "{colors.danger-container}"
    borderColor:     "#FECACA"
    rounded:         "{rounded.md}"
    note: "Carte zone de danger (données personnelles, suppression compte)."

  card-header:
    borderBottom:  "1px solid {colors.outline}"
    paddingBottom: "12px"
    marginBottom:  "16px"
    display:       "flex align-items:center justify-content:space-between"
    note: "En-tête interne de carte avec titre et action optionnelle."

  # ---- PASTILLES DE CATÉGORIE ----
  pill-category:
    rounded:     "{rounded.full}"
    padding:     "5px 12px"
    typography:  "{typography.micro}"
    minHeight:   "24px"
    note: >
      Chaque catégorie togolaise a une couleur distincte définie dans le JS
      (local-dictionary.js). La pastille doit toujours avoir un fond coloré
      et un texte à contraste ≥ 4.5:1.

  pill-status:
    rounded:     "{rounded.full}"
    padding:     "5px 12px"
    typography:  "{typography.micro}"
    fontWeight:  700
    letterSpacing: "0.3px"
    textTransform: "uppercase"
    variants:
      ok:      "background {colors.status-ok-bg} / text {colors.status-ok} / border rgba(22,163,74,0.3)"
      warning: "background {colors.status-warning-bg} / text {colors.status-warning} / border rgba(217,119,6,0.3)"
      danger:  "background {colors.status-danger-bg} / text {colors.status-danger} / border rgba(220,38,38,0.3)"

  # ---- JAUGES (barres de progression) ----
  gauge-track:
    backgroundColor: "rgba(255,255,255,0.18)"   # Sur fond bleu marine (hero)
    height:          "10px"
    rounded:         "{rounded.full}"
    overflow:        "hidden"

  gauge-fill:
    height:     "100%"
    rounded:    "{rounded.full}"
    transition: "width 0.6s ease"
    variants:
      ok:      "{colors.status-ok}"
      warning: "{colors.status-warning}"
      danger:  "{colors.status-danger}"

  # ---- ÉTATS VIDES ----
  empty-state:
    textAlign:  "center"
    padding:    "48px 24px"
    icon:       "fa fa-inbox (taille 48px, couleur {colors.outline-variant})"
    title:
      typography: "{typography.heading-md}"
      textColor:  "{colors.on-surface-variant}"
    description:
      typography: "{typography.body-md}"
      textColor:  "{colors.text-muted}"
    cta:
      component: "button-primary"
      marginTop: "16px"

  # ---- ÉTAT ERREUR ----
  error-state:
    backgroundColor: "{colors.danger-container}"
    border:          "1px solid {colors.danger}"
    rounded:         "{rounded.md}"
    padding:         "16px"
    icon:            "fa fa-exclamation-circle (couleur {colors.danger})"
    title:
      typography: "{typography.heading-md}"
      textColor:  "{colors.danger}"
    description:
      typography: "{typography.body-md}"
      textColor:  "{colors.on-danger-container}"
    cta: "Réessayer"

  # ---- ÉTAT CHARGEMENT ----
  loading-state:
    type:      "spinner Bootstrap (.spinner-border)"
    color:     "{colors.primary}"
    textColor: "{colors.text-muted}"
    typography: "{typography.body-md}"
    note: >
      Conserver le spinner Bootstrap existant. Ne pas utiliser
      d'animations CSS lourdes — réseau 2G/3G cible.
      Respecter prefers-reduced-motion.

  # ---- NAVIGATION MOBILE ----
  bottom-nav:
    backgroundColor: "{colors.surface}"
    borderTop:       "1px solid {colors.outline}"
    shadow:          "0 -4px 20px rgba(0, 0, 0, 0.08)"
    height:          "64px + safe-area-inset-bottom"
    tabMinHeight:    "48px"
    tabMinWidth:     "44px"
    activeColor:     "{colors.primary}"
    inactiveColor:   "{colors.on-surface-variant}"
    fab:
      size:      "44px"
      bg:        "{colors.primary}"
      activeHover: "{colors.secondary}"
      shadow:    "{shadows.floating}"

  # ---- NAVIGATION DESKTOP (SIDEBAR) ----
  sidebar:
    backgroundColor: "{colors.primary}"
    width:           "260px"
    navItem:
      padding:      "12px 16px"
      rounded:      "{rounded.sm}"
      textColor:    "rgba(255,255,255,0.85)"
      activeBackground: "{colors.secondary}"
      activeTextColor: "{colors.on-secondary}"
      activeShadow: "0 4px 12px rgba(16,185,130,0.35)"

  # ---- EN-TÊTE MOBILE ----
  header-mobile:
    backgroundColor: "{colors.primary}"
    textColor:       "{colors.on-primary}"
    shadow:          "{shadows.sm}"
    note: "Texte 'Nye' blanc / 'Ga' teal (#10B982). Aucun logo image (auth.html uniquement)."

  # ---- MODALE / BOTTOM SHEET ----
  modal:
    backdrop:        "rgba(0, 45, 122, 0.85)"
    backdropBlur:    "blur(4px)"
    backgroundColor: "{colors.surface}"
    rounded:         "{rounded.lg}"
    padding:         "20px"
    shadow:          "{shadows.lg}"
    handle:
      width:        "40px"
      height:       "4px"
      rounded:      "{rounded.full}"
      backgroundColor: "{colors.outline-variant}"
      marginBottom: "12px"

  # ---- TOAST NOTIFICATION ----
  toast:
    rounded:    "{rounded.sm}"
    padding:    "12px 20px"
    shadow:     "{shadows.floating}"
    note: "Toast NyeGa : positionnement bas-centre. Disparaît après 3s."

  # ---- CHIPS RAPIDES (montants fréquents) ----
  quick-chip:
    backgroundColor: "{colors.surface-variant}"
    textColor:       "{colors.primary}"
    border:          "1px solid {colors.outline}"
    rounded:         "{rounded.sm}"
    padding:         "8px 12px"
    minHeight:       "44px"
    activeBackground: "{colors.primary-container}"
    activeBorderColor: "{colors.primary}"
    typography:      "{typography.body-md}"
    fontWeight:      600

  # ---- TABLEAU D'ANALYSE ----
  breakdown-table:
    header:
      backgroundColor: "{colors.surface-variant}"
      textColor:       "{colors.on-surface-variant}"
      typography:      "{typography.label}"
    row:
      borderBottom:   "1px solid {colors.outline}"
      hoverBg:        "{colors.surface-variant}"
    colorBar:
      height:   "8px"
      rounded:  "{rounded.sm}"
      note: "Mini-jauge de proportion pour chaque ligne de catégorie."

# ============================================================
# TRANSITIONS & ANIMATION
# ============================================================
motion:
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
  screen-enter: "opacity 0→1, translateY 6px→0, durée 0.25s"
  reduced-motion: >
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms; transition-duration: 0.01ms; }
    }
  note: >
    Toujours déclarer prefers-reduced-motion. Sur réseau 2G/3G,
    les animations lourdes (3D, particules) sont interdites.

# ============================================================
# ACCESSIBILITÉ
# ============================================================
accessibility:
  contrast:
    minimum: "WCAG AA 4.5:1 pour tout texte normal"
    enhanced: "WCAG AAA 7:1 pour texte de taille ≥ 14px sur surfaces critiques"
  touch-targets:
    minimum: "44×44px pour tout élément interactif"
  focus:
    ring: "3px solid rgba(0, 45, 122, 0.4)"
    note: "Ne jamais supprimer l'outline de focus sans alternative visible."
  images: "Alt text obligatoire. Logo img uniquement sur auth.html."

# ============================================================
# TON DES TEXTES (Français, contexte étudiant togolais)
# ============================================================
copywriting:
  language: "Français neutre et chaleureux"
  currency: "FCFA — toujours écrit en toutes lettres ou 'F CFA', jamais '€' ni '$'"
  amount-format:
    example: "50 000 FCFA"
    separator: "espace insécable pour les milliers"
    note: "Pour les petits montants : '500 F' est acceptable. Jamais '0,5k F'."
  tone:
    style: "Direct, bienveillant, sans jargon financier"
    voice: "Parle à l'étudiant comme un allié, jamais de condescendance"
    examples:
      empty: "Aucune dépense pour l'instant. Commencez par ajouter votre premier achat !"
      success: "Dépense enregistrée avec succès."
      error: "Une erreur est survenue. Vérifiez votre connexion et réessayez."
      budget-ok: "Budget sain — continuez comme ça !"
      budget-warning: "Budget tendu — encore {amount} FCFA disponibles."
      budget-danger: "Budget dépassé de {amount} FCFA."
    prohibitions:
      - "Ne jamais utiliser 'oops' ou anglicismes dans les messages UI"
      - "Ne jamais afficher de stack traces dans l'interface"
      - "Ne jamais utiliser de majuscules lock (CRIER = inapproprié sauf pastilles)"

# ============================================================
# RESPONSIVE & BREAKPOINTS
# ============================================================
breakpoints:
  mobile:  "< 576px   — layout 1 colonne, bottom nav visible, sidebar masquée"
  tablet:  "576–767px — layout 1 colonne élargie"
  desktop-sm: "768–1024px — transitions vers sidebar"
  desktop: "> 1024px  — sidebar fixe 260px, main margin-left 260px, bottom nav masquée"

grid:
  mobile:  "12 colonnes Bootstrap, padding 12px"
  tablet:  "max-width 780px centré"
  desktop: "100% - 260px (sidebar)"

# ============================================================
# LOGO
# ============================================================
logo:
  usage: "img/logo/Logo_SANS_FOND.png — UNIQUEMENT sur auth.html (connexion/inscription)"
  forbidden: "Ne pas afficher le logo image dans l'app principale (index.html)"
  text-version: "Texte 'NyeGa' stylisé : 'Nye' en blanc, 'Ga' en {colors.secondary}"

# ============================================================
# DO's & DON'Ts
# ============================================================
dos:
  - "Utiliser uniquement les tokens de couleur définis dans ce document"
  - "Respecter la cible tactile minimale de 44px sur tous les éléments interactifs"
  - "Afficher le montant en FCFA avec espace insécable (50 000 FCFA)"
  - "Déclarer prefers-reduced-motion dans toutes les animations"
  - "Conserver les ids et attributs HTML utilisés par le JS sans modification"
  - "Héberger les polices localement — pas d'appel Google Fonts en production"
  - "Assurer le contraste WCAG AA minimum pour tout le texte"

donts:
  - "Ne jamais introduire une couleur hors tokens"
  - "Ne jamais utiliser du 3D (Three.js, WebGL) — trop lourd pour 2G/3G"
  - "Ne jamais afficher le logo image dans index.html"
  - "Ne jamais modifier les fichiers JS de logique (app.js, auth.js, supabase-client.js, etc.)"
  - "Ne jamais utiliser des gradients atmosphériques décoratifs non liés à la charte"
  - "Ne jamais utiliser de typos Google Fonts chargées depuis un CDN externe en production"
  - "Ne jamais écrire les prix en '€' ou '$'"
---

## Vue d'ensemble

NyeGa est une application de gestion de budget mobile-first conçue pour les **étudiants togolais**. Son identité visuelle est ancrée dans les couleurs de son logo officiel :

- **Bleu marine** (`#002D7A`) — Sérieux, confiance, discipline budgétaire.
- **Vert Teal** (`#10B982`) — Croissance, vitalité, optimisme.
- **Doré** (`#FBB418`) — Ambition, réussite, valeur symbolique.

Ces trois couleurs forment le cœur de l'identité NyeGa. Elles ne sont **jamais** remplacées par des équivalents issus d'autres marques (pas de vert Supabase, pas de violet Stripe, pas de noir Vercel).

### Contexte de déploiement
L'application est conçue pour fonctionner sur **réseau 2G/3G** au Togo. Toute décision de design doit minimiser le poids des ressources (pas de fonts CDN en prod, pas d'animations lourdes, pas de 3D).

### Devise
Le FCFA est la devise exclusive. Toujours afficher les montants en `FCFA` ou `F CFA`, jamais en `€` ni en devise étrangère.

### Accessibilité
Contraste WCAG AA partout. Cibles tactiles ≥ 44 px. `prefers-reduced-motion` déclaré sur toutes les animations.
