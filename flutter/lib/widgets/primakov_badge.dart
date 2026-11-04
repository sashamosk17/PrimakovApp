import 'package:flutter/material.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';

/// PrimakovBadge - Minimalist status pill and category chip
/// Clean Apple/Stitch styling: pastel soft fill + saturated foreground + uppercase label
class PrimakovBadge extends StatelessWidget {
  final String label;
  final IconData? icon;
  final Color backgroundColor;
  final Color textColor;
  final Color? borderColor;
  final EdgeInsetsGeometry padding;
  final bool isUppercase;

  const PrimakovBadge({
    Key? key,
    required this.label,
    this.icon,
    required this.backgroundColor,
    required this.textColor,
    this.borderColor,
    this.padding = const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    this.isUppercase = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
        border: borderColor != null
            ? Border.all(color: borderColor!, width: 0.8)
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (icon != null) ...[
            Icon(
              icon,
              size: 12,
              color: textColor,
            ),
            const SizedBox(width: 4),
          ],
          Text(
            isUppercase ? label.toUpperCase() : label,
            style: AppTypography.labelExtraSmall.copyWith(
              color: textColor,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.1,
            ),
          ),
        ],
      ),
    );
  }
}

