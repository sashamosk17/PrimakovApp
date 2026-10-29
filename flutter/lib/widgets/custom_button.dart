import 'package:flutter/material.dart';
import '../config/app_colors.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';

enum ButtonType { primary, secondary, tertiary }

/// CustomButton styled according to "The Academic Curator" (Stitch):
/// - Primary: 16px radius, subtle vertical gradient (#6c0c08 -> #8c251c), diffused ambient shadow, no border.
/// - Secondary: surface-container-highest background (#e2e2e4), on-surface-variant text (#57423e), NO border (No-Line Rule).
/// - Tertiary: text-only in primary red, transparent background, for "See All" / "Cancel".
/// - Minimum touch target 48dp enforced.
class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonType type;
  final Widget? icon;
  final bool isLoading;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.type = ButtonType.primary,
    this.icon,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final borderRadius = BorderRadius.circular(AppSpacing.radiusButton);

    return Container(
      constraints: const BoxConstraints(
        minHeight: AppSpacing.minTouchTarget,
      ),
      decoration: type == ButtonType.primary
          ? BoxDecoration(
              gradient: isDark
                  ? const LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        AppColors.darkPrimaryContainer,
                        AppColors.darkPrimary,
                      ],
                    )
                  : AppColors.primaryGradient,
              borderRadius: borderRadius,
              boxShadow: AppColors.buttonShadow,
            )
          : null,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: borderRadius,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            decoration: BoxDecoration(
              color: _getBackgroundColor(isDark),
              borderRadius: borderRadius,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.max,
              children: [
                if (isLoading)
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        _getTextColor(isDark),
                      ),
                    ),
                  )
                else ...[
                  if (icon != null) ...[
                    icon!,
                    const SizedBox(width: 8),
                  ],
                  Text(
                    text,
                    style: AppTypography.button.copyWith(
                      color: _getTextColor(isDark),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getBackgroundColor(bool isDark) {
    switch (type) {
      case ButtonType.primary:
        return Colors.transparent;
      case ButtonType.secondary:
        // Stitch: surface-container-highest fill, strictly NO border
        return isDark
            ? AppColors.darkSurfaceContainerHighest
            : AppColors.surfaceContainerHighest;
      case ButtonType.tertiary:
        // Stitch: text-only, transparent background
        return Colors.transparent;
    }
  }

  Color _getTextColor(bool isDark) {
    switch (type) {
      case ButtonType.primary:
        return Colors.white;
      case ButtonType.secondary:
        // Stitch: on_surface_variant
        return isDark
            ? AppColors.darkOnSurfaceVariant
            : AppColors.onSurfaceVariant;
      case ButtonType.tertiary:
        // Stitch: primary red
        return isDark ? AppColors.darkPrimary : AppColors.primary;
    }
  }
}
