import 'package:flutter/material.dart';

/// Design System Colors - "The Academic Curator"
/// Synchronized with Stitch design system tokens.
/// Dark theme tokens are fully preserved per user requirements.
class AppColors {
  AppColors._();

  // ==========================================
  // Light Theme M3 Tokens (Stitch Academic Curator / Apple Human Interface)
  // ==========================================
  static const Color primary = Color(0xFF8B0000); // Noble Primakov Red
  static const Color primaryAccent = Color(0xFFBA1A1A); // Vibrant Primakov Accent
  static const Color primaryContainer = Color(0xFFBA1A1A);
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color onPrimaryContainer = Color(0xFFFFA396);
  static const Color primaryFixed = Color(0xFFFFDAD5);
  static const Color primaryFixedDim = Color(0xFFFFB4A9);
  static const Color onPrimaryFixed = Color(0xFF410001);
  static const Color onPrimaryFixedVariant = Color(0xFF862118);
  static const Color inversePrimary = Color(0xFFFFB4A9);

  // Surfaces (Tonal Layering: Canvas -> Low -> Container -> High -> Highest)
  static const Color surface = Color(0xFFF7F8FA); // Ultra-clean soft background
  static const Color surfaceBright = Color(0xFFF7F8FA);
  static const Color surfaceDim = Color(0xFFD9DADC);
  static const Color surfaceContainerLowest = Color(0xFFFFFFFF); // Card Lift
  static const Color surfaceContainerLow = Color(0xFFF1F3F6); // Sub-sections & inputs
  static const Color surfaceContainer = Color(0xFFE9ECF0);
  static const Color surfaceContainerHigh = Color(0xFFE2E6EC);
  static const Color surfaceContainerHighest = Color(0xFFDCE1E8); // Secondary button bg

  // Content & Contours
  static const Color onSurface = Color(0xFF1A1C1D); // Soft black (strictly no #000000)
  static const Color onSurfaceVariant = Color(0xFF57423E); // Secondary warm text
  static const Color inverseSurface = Color(0xFF2F3132);
  static const Color inverseOnSurface = Color(0xFFF0F0F2);
  static const Color outline = Color(0xFF8B716D);
  static const Color outlineVariant = Color(0xFFDEC0BB);
  static const Color surfaceTint = Color(0xFFA7382D);

  // Secondary & Tertiary
  static const Color secondary = Color(0xFF5F5E5E);
  static const Color secondaryContainer = Color(0xFFE2DFDE);
  static const Color onSecondary = Color(0xFFFFFFFF);
  static const Color onSecondaryContainer = Color(0xFF636262);
  static const Color secondaryFixed = Color(0xFFE5E2E1);
  static const Color secondaryFixedDim = Color(0xFFC8C6C5);
  static const Color onSecondaryFixed = Color(0xFF1B1C1C);
  static const Color onSecondaryFixedVariant = Color(0xFF474746);

  static const Color tertiary = Color(0xFF313438);
  static const Color tertiaryContainer = Color(0xFF484B4F);
  static const Color onTertiary = Color(0xFFFFFFFF);
  static const Color onTertiaryContainer = Color(0xFFB9BBC0);
  static const Color tertiaryFixed = Color(0xFFE0E2E7);
  static const Color tertiaryFixedDim = Color(0xFFC4C6CB);
  static const Color onTertiaryFixed = Color(0xFF191C20);
  static const Color onTertiaryFixedVariant = Color(0xFF44474B);

  // Error (Stitch Ruby Palette)
  static const Color error = Color(0xFFBA1A1A);
  static const Color errorContainer = Color(0xFFFFDAD6);
  static const Color onError = Color(0xFFFFFFFF);
  static const Color onErrorContainer = Color(0xFF93000A);

  // Status Colors
  static const Color success = Color(0xFF2E7D32);
  static const Color warning = Color(0xFFED6C02);

  // House Cup (Faculty System) Colors
  static const Color houseNorth = Color(0xFF1976D2);
  static const Color houseNorthPastel = Color(0xFFE3F2FD);
  static const Color houseNorthDark = Color(0xFF152A4A);

  static const Color houseSouth = Color(0xFFD97706);
  static const Color houseSouthPastel = Color(0xFFFEF3C7);
  static const Color houseSouthDark = Color(0xFF38260F);

  static const Color houseEast = Color(0xFF16A34A);
  static const Color houseEastPastel = Color(0xFFDCFCE7);
  static const Color houseEastDark = Color(0xFF14301D);

  static const Color houseWest = Color(0xFF7C3AED);
  static const Color houseWestPastel = Color(0xFFF3E8FF);
  static const Color houseWestDark = Color(0xFF2C194D);

  // Ghost Border Helper (subtle border rgba(0,0,0,0.06) or 15% opacity outline_variant)
  static Color get ghostBorder => const Color(0x0F000000); // 6% black
  static Color get darkGhostBorder => const Color(0x1AFFFFFF); // 10% white
  static Color get subtleBorder => const Color(0x0F000000); // rgba(0,0,0,0.06)
  static Color get darkSubtleBorder => const Color(0x1AFFFFFF); // rgba(255,255,255,0.10)

  // ==========================================
  // Modern Dark Theme Colors (#0E1116 Canvas)
  // ==========================================
  static const Color darkSurface = Color(0xFF0E1116);
  static const Color darkSurfaceContainerLowest = Color(0xFF090B0E);
  static const Color darkSurfaceContainerLow = Color(0xFF13171F);
  static const Color darkSurfaceContainer = Color(0xFF171B24);
  static const Color darkSurfaceContainerHigh = Color(0xFF1F2430);
  static const Color darkSurfaceContainerHighest = Color(0xFF282F3E);
  static const Color darkOnSurface = Color(0xFFE6EDF3);
  static const Color darkOnSurfaceVariant = Color(0xFF8B949E);
  static const Color darkInverseSurface = Color(0xFFF0F0F2);
  static const Color darkInverseOnSurface = Color(0xFF0E1116);
  static const Color darkOutline = Color(0xFF8B716D);
  static const Color darkOutlineVariant = Color(0xFF30363D);
  static const Color darkSurfaceTint = Color(0xFFFFB4A9);
  static const Color darkPrimary = Color(0xFFFF6B6B);
  static const Color darkOnPrimary = Color(0xFFFFFFFF);
  static const Color darkPrimaryContainer = Color(0xFF8B0000);
  static const Color darkOnPrimaryContainer = Color(0xFFFFDAD5);
  static const Color darkInversePrimary = Color(0xFF8B0000);
  static const Color darkSecondary = Color(0xFFC8C6C5);
  static const Color darkOnSecondary = Color(0xFFFFFFFF);
  static const Color darkSecondaryContainer = Color(0xFF2A2E39);
  static const Color darkOnSecondaryContainer = Color(0xFFE2DFDE);
  static const Color darkTertiary = Color(0xFFC4C6CB);
  static const Color darkOnTertiary = Color(0xFF2C3135);
  static const Color darkTertiaryContainer = Color(0xFF484B4F);
  static const Color darkOnTertiaryContainer = Color(0xFFB9BBC0);
  static const Color darkError = Color(0xFFFFB4AB);
  static const Color darkOnError = Color(0xFF690005);
  static const Color darkErrorContainer = Color(0xFF93000A);
  static const Color darkOnErrorContainer = Color(0xFFFFDAD6);
  static const Color darkPrimaryFixed = Color(0xFFFFDAD5);
  static const Color darkPrimaryFixedDim = Color(0xFFFFB4A9);
  static const Color darkOnPrimaryFixed = Color(0xFF410001);
  static const Color darkOnPrimaryFixedVariant = Color(0xFF862118);
  static const Color darkSecondaryFixed = Color(0xFFE5E2E1);
  static const Color darkSecondaryFixedDim = Color(0xFFC8C6C5);
  static const Color darkOnSecondaryFixed = Color(0xFF1B1C1C);
  static const Color darkOnSecondaryFixedVariant = Color(0xFF474746);
  static const Color darkTertiaryFixed = Color(0xFFE0E2E7);
  static const Color darkTertiaryFixedDim = Color(0xFFC4C6CB);
  static const Color darkOnTertiaryFixed = Color(0xFF191C20);
  static const Color darkOnTertiaryFixedVariant = Color(0xFF44474B);
  static const Color darkBackground = Color(0xFF0E1116);
  static const Color darkSurfaceVariant = Color(0xFF21262D);

  // ==========================================
  // Legacy & Semantic Aliases (Backwards Compatibility)
  // ==========================================
  static const Color primaryRed = primary;
  static const Color primaryRedLight = primaryAccent;
  static const Color darkPrimaryRed = darkPrimary;

  static const Color textPrimary = onSurface;
  static const Color textSecondary = secondary;
  static const Color textTertiary = Color(0xFF94A3B8);

  static const Color darkTextPrimary = darkOnSurface;
  static const Color darkTextSecondary = darkOnSurfaceVariant;

  static const Color backgroundPrimary = surface;
  static const Color backgroundSecondary = surfaceContainerLowest;
  static const Color backgroundTertiary = surfaceContainerLow;

  static const Color darkBackgroundPrimary = darkBackground;
  static const Color darkBackgroundSecondary = darkSurfaceContainer;
  static const Color darkBackgroundTertiary = darkSurfaceContainerLow;

  static const Color borderPrimary = outlineVariant;
  static const Color borderSecondary = secondaryContainer;

  static const Color darkBorderPrimary = darkOutlineVariant;
  static const Color darkBorderSecondary = darkSurfaceContainerHighest;

  // Glassmorphism (semi-transparent surface for backdrop-blur)
  static const Color glassBackground = Color(0xCCFFFFFF); // Frosted Glass (80% white)
  static const Color glassBorder = Color(0x33FFFFFF);
  static const Color modalBackdrop = Color(0x33000000); // 20% overlay

  static const Color darkGlassBackground = Color(0xCC161B22); // Frosted Glass Dark
  static const Color darkGlassBorder = Color(0x1FFFFFFF);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF8B0000), Color(0xFFBA1A1A)],
  );

  static const LinearGradient storyGradientRing = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFBA1A1A), Color(0xFFE53935), Color(0xFFFF8A80)],
  );

  // Story Colors
  static const Color storyBackground = Color(0xFFFFECEB);
  static const Color storyViewed = Color(0xFFDEC0BB);

  static const Color darkStoryBackground = darkSurfaceContainerHigh;
  static const Color darkStoryViewed = darkSurfaceContainerHighest;

  // Pastel Colors for Services Grid
  static const Color pastelRed = Color(0xFFFFECEB);
  static const Color pastelRedIcon = Color(0xFFBA1A1A);

  static const Color pastelAmber = Color(0xFFFFF4E5);
  static const Color pastelAmberIcon = Color(0xFFE65100);

  static const Color pastelIndigo = Color(0xFFEEF2FF);
  static const Color pastelIndigoIcon = Color(0xFF3F51B5);

  static const Color pastelGreen = Color(0xFFE8F5E9);
  static const Color pastelGreenIcon = Color(0xFF2E7D32);

  static const Color pastelPink = Color(0xFFFCE4EC);
  static const Color pastelPinkIcon = Color(0xFFC2185B);

  static const Color pastelBlue = Color(0xFFE1F5FE);
  static const Color pastelBlueIcon = Color(0xFF0288D1);

  // Dark Pastel Counterparts
  static const Color darkPastelRed = Color(0xFF2C1517);
  static const Color darkPastelAmber = Color(0xFF2C2214);
  static const Color darkPastelIndigo = Color(0xFF1A1F36);
  static const Color darkPastelGreen = Color(0xFF142918);
  static const Color darkPastelPink = Color(0xFF2E1724);
  static const Color darkPastelBlue = Color(0xFF132333);

  // Additional UI Colors
  static const Color lightGray = Color(0xFFF1F3F6);
  static const Color mediumGray = surfaceContainerHighest;
  static const Color iconGray = Color(0xFF8A9099);

  static const Color darkLightGray = darkSurfaceContainerHigh;
  static const Color darkMediumGray = darkSurfaceContainerHighest;
  static const Color darkIconGray = darkOnSurfaceVariant;

  // Premium Diffused Shadows (Apple HIG / Bento Grid 2.0)
  static List<BoxShadow> get buttonShadow => [
        const BoxShadow(
          color: Color(0x1F8B0000), // 12% noble red
          blurRadius: 18,
          offset: Offset(0, 6),
        ),
      ];

  static List<BoxShadow> get cardShadow => [
        const BoxShadow(
          color: Color(0x0A000000), // diffused 4% black
          blurRadius: 24,
          offset: Offset(0, 8),
        ),
      ];

  static List<BoxShadow> get darkCardShadow => [
        const BoxShadow(
          color: Color(0x40000000), // diffused black
          blurRadius: 24,
          offset: Offset(0, 8),
        ),
      ];

  static List<BoxShadow> get floatingShadow => [
        const BoxShadow(
          color: Color(0x14000000), // 8% diffused
          blurRadius: 32,
          offset: Offset(0, 10),
        ),
      ];

  static List<BoxShadow> get darkFloatingShadow => [
        const BoxShadow(
          color: Color(0x66000000), // 40% diffused deep
          blurRadius: 32,
          offset: Offset(0, 10),
        ),
      ];

  static List<BoxShadow> get toggleShadow => [
        const BoxShadow(
          color: Color(0x0A000000),
          blurRadius: 8,
          offset: Offset(0, 2),
        ),
      ];
}