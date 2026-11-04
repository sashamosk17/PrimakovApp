import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../config/app_colors.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';

enum ButtonType { primary, secondary, tertiary }

/// CustomButton styled according to "The Academic Curator" (Stitch):
/// - Primary: 16px radius, subtle vertical gradient, diffused ambient shadow, no border.
/// - Secondary: surface-container-highest background, on-surface-variant text, NO border (No-Line Rule).
/// - Tertiary: text-only in primary red, transparent background, for "See All" / "Cancel".
/// - Minimum touch target 48dp enforced.
/// - Micro-animation: soft spring scale (0.975) on press with haptic feedback.
class CustomButton extends StatefulWidget {
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
  State<CustomButton> createState() => _CustomButtonState();
}

class _CustomButtonState extends State<CustomButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final borderRadius = BorderRadius.circular(AppSpacing.radiusButton);

    return AnimatedScale(
      scale: _isPressed ? 0.975 : 1.0,
      duration: const Duration(milliseconds: 120),
      curve: Curves.easeOutCubic,
      child: Container(
        constraints: const BoxConstraints(
          minHeight: AppSpacing.minTouchTarget,
        ),
        decoration: widget.type == ButtonType.primary
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
            onTap: widget.isLoading || widget.onPressed == null
                ? null
                : () {
                    HapticFeedback.lightImpact();
                    widget.onPressed!();
                  },
            onHighlightChanged: (highlighted) {
              if (widget.onPressed != null && !widget.isLoading) {
                setState(() {
                  _isPressed = highlighted;
                });
              }
            },
            borderRadius: borderRadius,
            splashColor: Colors.transparent,
            highlightColor: Colors.transparent,
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
                  if (widget.isLoading)
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
                    if (widget.icon != null) ...[
                      widget.icon!,
                      const SizedBox(width: 8),
                    ],
                    Text(
                      widget.text,
                      style: AppTypography.button.copyWith(
                        color: _getTextColor(isDark),
                        letterSpacing: -0.2,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Color _getBackgroundColor(bool isDark) {
    switch (widget.type) {
      case ButtonType.primary:
        return Colors.transparent;
      case ButtonType.secondary:
        return isDark
            ? AppColors.darkSurfaceContainerHighest
            : AppColors.surfaceContainerHighest;
      case ButtonType.tertiary:
        return Colors.transparent;
    }
  }

  Color _getTextColor(bool isDark) {
    switch (widget.type) {
      case ButtonType.primary:
        return Colors.white;
      case ButtonType.secondary:
        return isDark
            ? AppColors.darkOnSurfaceVariant
            : AppColors.onSurfaceVariant;
      case ButtonType.tertiary:
        return isDark ? AppColors.darkPrimary : AppColors.primary;
    }
  }
}
