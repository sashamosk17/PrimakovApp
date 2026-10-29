import 'package:flutter/material.dart';

/// Design System Typography - "The Academic Curator"
/// Editorial voice: Manrope (Headings, Display, Buttons)
/// Informational voice: Inter (Body, Labels, Forms, Micro-metadata)
class AppTypography {
  AppTypography._();

  // ==========================================
  // Editorial Voice - Manrope (Headlines & Display)
  // ==========================================
  static const TextStyle displayLarge = TextStyle(
    fontFamily: 'Manrope',
    fontSize: 32,
    fontWeight: FontWeight.w700,
    height: 1.25, // 40px line height
    letterSpacing: -0.64, // -0.02em
  );

  static const TextStyle displayMedium = TextStyle(
    fontFamily: 'Manrope',
    fontSize: 28,
    fontWeight: FontWeight.w700,
    height: 1.28,
    letterSpacing: -0.56,
  );

  static const TextStyle headlineLarge = TextStyle(
    fontFamily: 'Manrope',
    fontSize: 24,
    fontWeight: FontWeight.w700,
    height: 1.33, // 32px line height
    letterSpacing: -0.24, // -0.01em
  );

  static const TextStyle headlineMedium = TextStyle(
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 1.4, // 28px line height
    letterSpacing: -0.2,
  );

  static const TextStyle headlineSmall = TextStyle(
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: FontWeight.w600,
    height: 1.4,
  );

  // Backward-compatible Heading Aliases
  static const TextStyle heading1 = headlineLarge;
  static const TextStyle heading2 = headlineMedium;
  static const TextStyle heading3 = TextStyle(
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: FontWeight.w600,
    height: 1.5,
  );

  // ==========================================
  // Informational Voice - Inter (Body Text)
  // ==========================================
  static const TextStyle bodyLarge = TextStyle(
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 1.5, // 24px line height
  );

  static const TextStyle bodyMedium = TextStyle(
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: FontWeight.w500,
    height: 1.43, // 20px line height
  );

  static const TextStyle bodySmall = TextStyle(
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.33, // 16px line height
  );

  // ==========================================
  // Labels & Micro-Typography (Inter)
  // ==========================================
  static const TextStyle labelLarge = TextStyle(
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: FontWeight.w600,
    height: 1.43,
    letterSpacing: 0.1,
  );

  static const TextStyle labelMedium = TextStyle(
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: FontWeight.w600,
    height: 1.33,
    letterSpacing: 0.5,
  );

  static const TextStyle labelSmall = TextStyle(
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: FontWeight.w600,
    height: 1.45,
    letterSpacing: 1.2,
  );

  /// Key Stitch Academic Curator element: 10px uppercase tracking-widest
  /// Used for category chips, eyebrows, status badges and section tags
  static const TextStyle labelExtraSmall = TextStyle(
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: FontWeight.w700,
    height: 1.5,
    letterSpacing: 1.5,
  );

  // Button Text (Manrope)
  static const TextStyle button = TextStyle(
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: FontWeight.w700,
    height: 1.5,
  );

  // Placeholder Text (Inter)
  static const TextStyle placeholder = TextStyle(
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 1.5,
  );
}
