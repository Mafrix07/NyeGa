import 'package:flutter/material.dart';

/// ====================================================================
/// NYEGA FLUTTER THEME & DESIGN TOKENS
/// Application mobile de gestion de budget pour étudiants
///
/// Palette extraite du logo officiel NyeGa :
/// - Bleu Marine (#002D7A) : Capuchon & texte "Nye"
/// - Vert / Teal (#10B982)  : Feuille & texte "Ga"
/// - Doré / Jaune (#FBB418) : Croissant dynamique
/// - Rouge critique (#DC2626) : Signaux de danger & alertes
/// ====================================================================

class NyegaColors {
  NyegaColors._();

  // --- COULEURS DE MARQUE OFFICIELLES ---
  static const Color primaryNavy = Color(0xFF002D7A);      // Nye & Capuchon
  static const Color secondaryTeal = Color(0xFF10B982);    // Ga & Croissance
  static const Color tertiaryGold = Color(0xFFFBB418);     // Croissant en or
  static const Color errorRed = Color(0xFFDC2626);         // Rouge critique

  // --- STATUTS BUDGÉTAIRES (Vert distinct de la marque #10B982) ---
  static const Color statusOk = Color(0xFF16A34A);         // Vert statut normal
  static const Color statusWarning = Color(0xFFD97706);    // Orange alerte douce
  static const Color statusDanger = Color(0xFFDC2626);     // Rouge budget dépassé

  // --- LES 7 CATÉGORIES TOGOLAISES OFFICIELLES ---
  static const Color catAlimentation = Color(0xFF10B982);
  static const Color catTransport = Color(0xFFFBB418);
  static const Color catSoinsBeaute = Color(0xFFEC4899);
  static const Color catInternet = Color(0xFF2563EB);
  static const Color catAppels = Color(0xFF06B6D4);
  static const Color catPlaisirs = Color(0xFF8B5CF6);
  static const Color catAutres = Color(0xFF64748B);

  // --- NEUTRES & SURFACES ---
  static const Color backgroundLight = Color(0xFFF8FAFC);  // Fond très clair bleuté
  static const Color surfaceWhite = Color(0xFFFFFFFF);     // Cartes & modales
  static const Color surfaceVariant = Color(0xFFF1F5F9);   // Champs de saisie & fonds légers
  static const Color textDark = Color(0xFF0F172A);         // Titres & chiffres clés (WCAG AAA)
  static const Color textMuted = Color(0xFF475569);        // Sous-titres & libellés (WCAG AAA)
  static const Color textLight = Color(0xFF64748B);        // Dates & métadonnées
  static const Color outline = Color(0xFFE2E8F0);          // Bordures & séparateurs
}

/// ColorScheme Material 3 conforme aux normes d'accessibilité WCAG AA / AAA
final ColorScheme nyegaColorScheme = ColorScheme(
  brightness: Brightness.light,

  // Primaire : Bleu marine
  primary: NyegaColors.primaryNavy,
  onPrimary: Colors.white,
  primaryContainer: const Color(0xFFEBF2FF),
  onPrimaryContainer: const Color(0xFF001A4D),

  // Secondaire : Vert / Teal
  secondary: NyegaColors.secondaryTeal,
  onSecondary: Colors.white,
  secondaryContainer: const Color(0xFFD1FAE5),
  onSecondaryContainer: const Color(0xFF064E3B),

  // Tertiaire : Doré
  tertiary: NyegaColors.tertiaryGold,
  // Note de contraste : OnTertiary utilise le bleu marine foncé pour garantir
  // un ratio de contraste supérieur à 7.0:1 (WCAG AAA)
  onTertiary: NyegaColors.primaryNavy,
  tertiaryContainer: const Color(0xFFFEF3C7),
  onTertiaryContainer: const Color(0xFF78350F),

  // Erreur : Rouge standard
  error: NyegaColors.errorRed,
  onError: Colors.white,
  errorContainer: const Color(0xFFFEE2E2),
  onErrorContainer: const Color(0xFF7F1D1D),

  // Fond & Surfaces
  surface: NyegaColors.surfaceWhite,
  onSurface: NyegaColors.textDark,
  surfaceContainerHighest: NyegaColors.surfaceVariant,
  onSurfaceVariant: NyegaColors.textMuted,
  outline: NyegaColors.outline,
  outlineVariant: const Color(0xFFCBD5E1),
  shadow: const Color(0x1A002D7A),
);

/// Extension de thème pour les statuts budgétaires personnalisés
class BudgetStatusTheme extends ThemeExtension<BudgetStatusTheme> {
  final Color okColor;
  final Color warningColor;
  final Color dangerColor;

  const BudgetStatusTheme({
    required this.okColor,
    required this.warningColor,
    required this.dangerColor,
  });

  @override
  BudgetStatusTheme copyWith({
    Color? okColor,
    Color? warningColor,
    Color? dangerColor,
  }) {
    return BudgetStatusTheme(
      okColor: okColor ?? this.okColor,
      warningColor: warningColor ?? this.warningColor,
      dangerColor: dangerColor ?? this.dangerColor,
    );
  }

  @override
  BudgetStatusTheme lerp(ThemeExtension<BudgetStatusTheme>? other, double t) {
    if (other is! BudgetStatusTheme) return this;
    return BudgetStatusTheme(
      okColor: Color.lerp(okColor, other.okColor, t)!,
      warningColor: Color.lerp(warningColor, other.warningColor, t)!,
      dangerColor: Color.lerp(dangerColor, other.dangerColor, t)!,
    );
  }

  static const light = BudgetStatusTheme(
    okColor: NyegaColors.statusOk,
    warningColor: NyegaColors.statusWarning,
    dangerColor: NyegaColors.statusDanger,
  );
}

/// Thème complet Nyega prêt pour l'application Flutter
ThemeData buildNyegaTheme() {
  final baseTheme = ThemeData(
    useMaterial3: true,
    colorScheme: nyegaColorScheme,
    scaffoldBackgroundColor: NyegaColors.backgroundLight,
    fontFamily: 'DM Sans',
  );

  return baseTheme.copyWith(
    // Titres en Nunito
    textTheme: baseTheme.textTheme.copyWith(
      headlineLarge: const TextStyle(
        fontFamily: 'Nunito',
        fontWeight: FontWeight.w900,
        color: NyegaColors.primaryNavy,
      ),
      headlineMedium: const TextStyle(
        fontFamily: 'Nunito',
        fontWeight: FontWeight.w800,
        color: NyegaColors.primaryNavy,
      ),
      headlineSmall: const TextStyle(
        fontFamily: 'Nunito',
        fontWeight: FontWeight.w700,
        color: NyegaColors.primaryNavy,
      ),
      titleLarge: const TextStyle(
        fontFamily: 'Nunito',
        fontWeight: FontWeight.w700,
        color: NyegaColors.primaryNavy,
      ),
    ),

    // Cartes avec border radius de 12px et bordure subtile
    cardTheme: CardTheme(
      color: NyegaColors.surfaceWhite,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: NyegaColors.outline),
      ),
    ),

    // Boutons primaires en bleu marine
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: NyegaColors.primaryNavy,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        textStyle: const TextStyle(
          fontWeight: FontWeight.w700,
          fontSize: 15,
        ),
      ),
    ),

    // Barre de navigation inférieure (Mobile First)
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: NyegaColors.surfaceWhite,
      indicatorColor: nyegaColorScheme.primaryContainer,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 12,
            color: NyegaColors.primaryNavy,
          );
        }
        return const TextStyle(
          fontWeight: FontWeight.w500,
          fontSize: 12,
          color: NyegaColors.textMuted,
        );
      }),
    ),

    extensions: <ThemeExtension<dynamic>>[
      BudgetStatusTheme.light,
    ],
  );
}
