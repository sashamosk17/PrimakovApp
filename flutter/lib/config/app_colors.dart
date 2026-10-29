import 'package:flutter/material.dart';

/// Design System Colors - "The Academic Curator"
/// Synchronized with Stitch design system tokens.
/// Dark theme tokens are fully preserved per user requirements.
class AppColors {
  AppColors._();

  // ==========================================
  // Light Theme M3 Tokens (Stitch Academic Curator)
  // ==========================================
  static const Color primary = Color(0xFF6C0C08);
  static const Color primaryContainer = Color(0xFF8C251C);
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color onPrimaryContainer = Color(0xFFFFA396);
  static const Color primaryFixed = Color(0xFFFFDAD5);
  static const Color primaryFixedDim = Color(0xFFFFB4A9);
  static const Color onPrimaryFixed = Color(0xFF410001);
  static const Color onPrimaryFixedVariant = Color(0xFF862118);
  static const Color inversePrimary = Color(0xFFFFB4A9);

  // Surfaces (Tonal Layering: Canvas -> Low -> Container -> High -> Highest)
  static const Color surface = Color(0xFFF9F9FB);
  static const Color surfaceBright = Color(0xFFF9F9FB);
  static const Color surfaceDim = Color(0xFFD9DADC);
  static const Color surfaceContainerLowest = Color(0xFFFFFFFF); // Card Lift
  static const Color surfaceContainerLow = Color(0xFFF3F3F5); // Sub-sections & inputs
  static const Color surfaceContainer = Color(0xFFEEEEF0);
  static const Color surfaceContainerHigh = Color(0xFFE8E8EA);
  static const Color surfaceContainerHighest = Color(0xFFE2E2E4); // Secondary button bg

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

  // Ghost Border Helper (15% opacity outline_variant per Stitch spec)
  static Color get ghostBorder => outlineVariant.withOpacity(0.15);

  // ==========================================
  // Preserved Dark Theme Colors (Untouched per user request)
  // ==========================================
  static const Color darkSurface = Color(0xFF121416);
  static const Color darkSurfaceContainerLowest = Color(0xFF0F1113);
  static const Color darkSurfaceContainerLow = Color(0xFF1A1C1D);
  static const Color darkSurfaceContainer = Color(0xFF1E2124);
  static const Color darkSurfaceContainerHigh = Color(0xFF2A2D31);
  static const Color darkSurfaceContainerHighest = Color(0xFF33363A);
  static const Color darkOnSurface = Color(0xFFE2E2E4);
  static const Color darkOnSurfaceVariant = Color(0xFFDEC0BB);
  static const Color darkInverseSurface = Color(0xFFF0F0F2);
  static const Color darkInverseOnSurface = Color(0xFF1A1C1D);
  static const Color darkOutline = Color(0xFF8B716D);
  static const Color darkOutlineVariant = Color(0xFF534341);
  static const Color darkSurfaceTint = Color(0xFFFFB4A9);
  static const Color darkPrimary = Color(0xFFFFA396);
  static const Color darkOnPrimary = Color(0xFFFFFFFF);
  static const Color darkPrimaryContainer = Color(0xFF8C251C);
  static const Color darkOnPrimaryContainer = Color(0xFFFFA396);
  static const Color darkInversePrimary = Color(0xFFA7382D);
  static const Color darkSecondary = Color(0xFFC8C6C5);
  static const Color darkOnSecondary = Color(0xFFFFFFFF);
  static const Color darkSecondaryContainer = Color(0xFF474746);
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
  static const Color darkBackground = Color(0xFF0F1113);
  static const Color darkSurfaceVariant = Color(0xFF534341);

  // ==========================================
  // Legacy & Semantic Aliases (Backwards Compatibility)
  // ==========================================
  static const Color primaryRed = primary;
  static const Color primaryRedLight = primaryContainer;
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
  static const Color darkBackgroundSecondary = darkSurface;
  static const Color darkBackgroundTertiary = darkSurfaceContainer;

  static const Color borderPrimary = outlineVariant;
  static const Color borderSecondary = secondaryContainer;

  static const Color darkBorderPrimary = darkOutlineVariant;
  static const Color darkBorderSecondary = darkSurfaceContainerHighest;

  // Glassmorphism (semi-transparent surface for backdrop-blur)
  static const Color glassBackground = Color(0xD9F9F9FB); // ~85% opacity surface
  static const Color modalBackdrop = Color(0x331A1C1D); // ~20% opacity on_surface

  static const Color darkGlassBackground = Color(0xD9121416);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [primaryRed, primaryRedLight],
  );

  // Story Colors
  static const Color storyBackground = Color(0xFFFFEBEE);
  static const Color storyViewed = outlineVariant;

  static const Color darkStoryBackground = darkSurfaceContainerHigh;
  static const Color darkStoryViewed = darkSurfaceContainerHighest;

  // Additional UI Colors
  static const Color lightGray = Color(0xFFF5F5F5);
  static const Color mediumGray = surfaceContainerHighest;
  static const Color iconGray = Color(0xFF9E9E9E);

  static const Color darkLightGray = darkSurfaceContainerHigh;
  static const Color darkMediumGray = darkSurfaceContainerHighest;
  static const Color darkIconGray = darkOnSurfaceVariant;

  // Ambient Shadows (Stitch Academic Curator: diffused 24-40px blur, 4-6% opacity)
  static List<BoxShadow> get buttonShadow => [
        BoxShadow(
          color: primaryRed.withOpacity(0.12),
          blurRadius: 16,
          offset: const Offset(0, 4),
        ),
      ];

  static List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: onSurface.withOpacity(0.04),
          blurRadius: 24,
          offset: const Offset(0, 4),
        ),
      ];

  static List<BoxShadow> get toggleShadow => [
        BoxShadow(
          color: onSurface.withOpacity(0.04),
          blurRadius: 6,
          offset: const Offset(0, 2),
        ),
      ];
}