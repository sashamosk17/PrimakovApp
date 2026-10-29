import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Main Theme Configuration
/// Implements Material 3 and "The Academic Curator" design system from Stitch.
/// Dark theme colors are preserved per user instructions.
class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,

      // Complete Material 3 Color Scheme
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        onPrimary: AppColors.onPrimary,
        primaryContainer: AppColors.primaryContainer,
        onPrimaryContainer: AppColors.onPrimaryContainer,
        secondary: AppColors.secondary,
        onSecondary: AppColors.onSecondary,
        secondaryContainer: AppColors.secondaryContainer,
        onSecondaryContainer: AppColors.onSecondaryContainer,
        tertiary: AppColors.tertiary,
        onTertiary: AppColors.onTertiary,
        tertiaryContainer: AppColors.tertiaryContainer,
        onTertiaryContainer: AppColors.onTertiaryContainer,
        surface: AppColors.surface,
        onSurface: AppColors.onSurface,
        onSurfaceVariant: AppColors.onSurfaceVariant,
        surfaceContainerLowest: AppColors.surfaceContainerLowest,
        surfaceContainerLow: AppColors.surfaceContainerLow,
        surfaceContainer: AppColors.surfaceContainer,
        surfaceContainerHigh: AppColors.surfaceContainerHigh,
        surfaceContainerHighest: AppColors.surfaceContainerHighest,
        outline: AppColors.outline,
        outlineVariant: AppColors.outlineVariant,
        error: AppColors.error,
        onError: AppColors.onError,
        errorContainer: AppColors.errorContainer,
        onErrorContainer: AppColors.onErrorContainer,
        inverseSurface: AppColors.inverseSurface,
        onInverseSurface: AppColors.inverseOnSurface,
        inversePrimary: AppColors.inversePrimary,
        surfaceTint: AppColors.surfaceTint,
      ),

      // Scaffold
      scaffoldBackgroundColor: AppColors.surface,

      // App Bar
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.glassBackground,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: AppTypography.heading1,
        iconTheme: IconThemeData(
          color: AppColors.onSurface,
          size: 24,
        ),
      ),

      // Text Theme
      textTheme: const TextTheme(
        displayLarge: AppTypography.displayLarge,
        displayMedium: AppTypography.displayMedium,
        headlineLarge: AppTypography.headlineLarge,
        headlineMedium: AppTypography.headlineMedium,
        headlineSmall: AppTypography.headlineSmall,
        bodyLarge: AppTypography.bodyLarge,
        bodyMedium: AppTypography.bodyMedium,
        bodySmall: AppTypography.bodySmall,
        labelLarge: AppTypography.labelLarge,
        labelMedium: AppTypography.labelMedium,
        labelSmall: AppTypography.labelSmall,
      ),

      // Input Decoration (Stitch: fill surface_container_low, bottom 2px indicator)
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceContainerLow,
        border: UnderlineInputBorder(
          borderSide: BorderSide(
            color: AppColors.outlineVariant,
            width: 2,
          ),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(AppSpacing.radiusInput),
            topRight: Radius.circular(AppSpacing.radiusInput),
          ),
        ),
        enabledBorder: UnderlineInputBorder(
          borderSide: BorderSide(
            color: AppColors.outlineVariant,
            width: 2,
          ),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(AppSpacing.radiusInput),
            topRight: Radius.circular(AppSpacing.radiusInput),
          ),
        ),
        focusedBorder: UnderlineInputBorder(
          borderSide: BorderSide(
            color: AppColors.primary,
            width: 2,
          ),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(AppSpacing.radiusInput),
            topRight: Radius.circular(AppSpacing.radiusInput),
          ),
        ),
        contentPadding: EdgeInsets.fromLTRB(16, 18, 16, 20),
        hintStyle: AppTypography.placeholder,
        labelStyle: AppTypography.labelMedium,
      ),

      // Elevated Button
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          textStyle: AppTypography.button,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusButton),
          ),
          elevation: 0,
        ),
      ),

      // Card (Stitch: surface-container-lowest, strictly 16px, zero elevation)
      cardTheme: const CardThemeData(
        color: AppColors.surfaceContainerLowest,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(AppSpacing.radiusCard)),
        ),
      ),

      // Divider (Stitch No-Line rule: ghost border 15% opacity or transparent)
      dividerTheme: DividerThemeData(
        color: AppColors.outlineVariant.withOpacity(0.15),
        thickness: 1,
        space: 1,
      ),

      // SnackBar
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.onSurface,
        contentTextStyle: const TextStyle(color: AppColors.surface, fontWeight: FontWeight.w500),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,

      // Color Scheme
      colorScheme: const ColorScheme.dark(
        primary: AppColors.darkPrimary,
        secondary: AppColors.darkSecondary,
        surface: AppColors.darkSurface,
        onSurface: AppColors.darkOnSurface,
        error: AppColors.darkError,
        onPrimary: AppColors.darkOnPrimary,
        primaryContainer: AppColors.darkPrimaryContainer,
        onPrimaryContainer: AppColors.darkOnPrimaryContainer,
        surfaceContainerLowest: AppColors.darkSurfaceContainerLowest,
        surfaceContainerLow: AppColors.darkSurfaceContainerLow,
        surfaceContainer: AppColors.darkSurfaceContainer,
        surfaceContainerHigh: AppColors.darkSurfaceContainerHigh,
        surfaceContainerHighest: AppColors.darkSurfaceContainerHighest,
        onSecondary: AppColors.darkOnSecondary,
        secondaryContainer: AppColors.darkSecondaryContainer,
        onSecondaryContainer: AppColors.darkOnSecondaryContainer,
        tertiary: AppColors.darkTertiary,
        onTertiary: AppColors.darkOnTertiary,
        tertiaryContainer: AppColors.darkTertiaryContainer,
        onTertiaryContainer: AppColors.darkOnTertiaryContainer,
        onError: AppColors.darkOnError,
        errorContainer: AppColors.darkErrorContainer,
        onErrorContainer: AppColors.darkOnErrorContainer,
        outline: AppColors.darkOutline,
        outlineVariant: AppColors.darkOutlineVariant,
        inverseSurface: AppColors.darkInverseSurface,
        onInverseSurface: AppColors.darkInverseOnSurface,
        inversePrimary: AppColors.darkInversePrimary,
        surfaceTint: AppColors.darkSurfaceTint,
      ),

      // Scaffold
      scaffoldBackgroundColor: AppColors.darkBackground,

      // App Bar
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.darkGlassBackground,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: AppTypography.heading1.copyWith(
          color: AppColors.darkTextPrimary,
        ),
        iconTheme: const IconThemeData(
          color: AppColors.darkTextPrimary,
          size: 24,
        ),
      ),

      // Text Theme
      textTheme: TextTheme(
        displayLarge: AppTypography.heading1.copyWith(color: AppColors.darkTextPrimary),
        displayMedium: AppTypography.heading2.copyWith(color: AppColors.darkTextPrimary),
        displaySmall: AppTypography.heading3.copyWith(color: AppColors.darkTextPrimary),
        bodyLarge: AppTypography.bodyLarge.copyWith(color: AppColors.darkTextPrimary),
        bodyMedium: AppTypography.bodyMedium.copyWith(color: AppColors.darkTextPrimary),
        bodySmall: AppTypography.bodySmall.copyWith(color: AppColors.darkTextSecondary),
        labelLarge: AppTypography.labelLarge.copyWith(color: AppColors.darkTextPrimary),
        labelSmall: AppTypography.labelSmall.copyWith(color: AppColors.darkTextSecondary),
      ),

      // Input Decoration
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkBackgroundTertiary,
        border: UnderlineInputBorder(
          borderSide: BorderSide(
            color: AppColors.darkBorderPrimary,
            width: 2,
          ),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(AppSpacing.radiusInput),
            topRight: Radius.circular(AppSpacing.radiusInput),
          ),
        ),
        enabledBorder: UnderlineInputBorder(
          borderSide: BorderSide(
            color: AppColors.darkBorderPrimary,
            width: 2,
          ),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(AppSpacing.radiusInput),
            topRight: Radius.circular(AppSpacing.radiusInput),
          ),
        ),
        focusedBorder: UnderlineInputBorder(
          borderSide: BorderSide(
            color: AppColors.darkPrimaryRed,
            width: 2,
          ),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(AppSpacing.radiusInput),
            topRight: Radius.circular(AppSpacing.radiusInput),
          ),
        ),
        contentPadding: EdgeInsets.fromLTRB(16, 18, 16, 20),
      ),

      // Elevated Button
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.darkPrimaryRed,
          foregroundColor: Colors.white,
          textStyle: AppTypography.button,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusButton),
          ),
          elevation: 0,
        ),
      ),

      // Card
      cardTheme: const CardThemeData(
        color: AppColors.darkBackgroundSecondary,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(AppSpacing.radiusCard)),
        ),
      ),

      // Divider
      dividerTheme: const DividerThemeData(
        color: AppColors.darkBorderSecondary,
        thickness: 1,
        space: 1,
      ),

      // SnackBar
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.darkSurfaceContainerHighest,
        contentTextStyle: const TextStyle(color: AppColors.darkOnSurface, fontWeight: FontWeight.w500),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
