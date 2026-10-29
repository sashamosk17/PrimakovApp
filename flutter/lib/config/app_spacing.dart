import 'package:flutter/material.dart';

/// Design System Spacing Constants - "The Academic Curator"
/// Consistent spacing values for padding, margins, and gaps.
class AppSpacing {
  AppSpacing._();

  // Spacing Scale (8px mathematical baseline)
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;

  // Accessibility Touch Target Minimum
  static const double minTouchTarget = 48.0;

  // Common EdgeInsets
  static const EdgeInsets paddingXS = EdgeInsets.all(xs);
  static const EdgeInsets paddingSM = EdgeInsets.all(sm);
  static const EdgeInsets paddingMD = EdgeInsets.all(md);
  static const EdgeInsets paddingLG = EdgeInsets.all(lg);
  static const EdgeInsets paddingXL = EdgeInsets.all(xl);

  // Horizontal/Vertical shortcuts
  static const EdgeInsets horizontalMD = EdgeInsets.symmetric(horizontal: md);
  static const EdgeInsets verticalMD = EdgeInsets.symmetric(vertical: md);
  static const EdgeInsets horizontalLG = EdgeInsets.symmetric(horizontal: lg);
  static const EdgeInsets verticalLG = EdgeInsets.symmetric(vertical: lg);

  // Border Radius (Stitch Academic Curator: strictly 16px for cards & buttons)
  static const double radiusSM = 8.0;
  static const double radiusMD = 12.0; // Inputs, inner elements
  static const double radiusLG = 16.0; // Cards, Buttons, BottomSheet, Containers
  static const double radiusXL = 24.0;
  static const double radiusPill = 9999.0; // Badges, Status pills

  // Semantic Radius Shortcuts
  static const double radiusCard = radiusLG;
  static const double radiusButton = radiusLG;
  static const double radiusInput = radiusMD;

  static BorderRadius get borderRadiusSM => BorderRadius.circular(radiusSM);
  static BorderRadius get borderRadiusMD => BorderRadius.circular(radiusMD);
  static BorderRadius get borderRadiusLG => BorderRadius.circular(radiusLG);
  static BorderRadius get borderRadiusXL => BorderRadius.circular(radiusXL);
  static BorderRadius get borderRadiusCard => BorderRadius.circular(radiusCard);
  static BorderRadius get borderRadiusPill => BorderRadius.circular(radiusPill);
}
