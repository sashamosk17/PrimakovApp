import 'package:flutter/material.dart';
import '../config/app_colors.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';

/// CustomTextField styled per "The Academic Curator" (Stitch):
/// - Fill: surface_container_low (#f3f3f5 in light theme)
/// - Bottom Indicator: 2px outline_variant (#dec0bb), transforms to primary (#6c0c08) on focus
/// - Label: uppercase tracking-widest in secondary color
/// - Helper text: label-sm (11px)
/// - Top corners: 12px rounded
class CustomTextField extends StatelessWidget {
  final String label;
  final String? placeholder;
  final String? helperText;
  final TextEditingController? controller;
  final int maxLines;
  final TextInputType? keyboardType;
  final bool readOnly;
  final bool obscureText;
  final VoidCallback? onTap;
  final Widget? suffixIcon;
  final Widget? prefixIcon;
  final String? Function(String?)? validator;

  const CustomTextField({
    super.key,
    required this.label,
    this.placeholder,
    this.helperText,
    this.controller,
    this.maxLines = 1,
    this.keyboardType,
    this.readOnly = false,
    this.obscureText = false,
    this.onTap,
    this.suffixIcon,
    this.prefixIcon,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    final fillColor = isDarkMode
        ? AppColors.darkBackgroundTertiary
        : AppColors.surfaceContainerLow;

    final baseBorderColor = isDarkMode
        ? AppColors.darkBorderPrimary
        : AppColors.outlineVariant;

    final focusBorderColor = isDarkMode
        ? AppColors.darkPrimaryRed
        : AppColors.primary;

    final errorColor = isDarkMode
        ? AppColors.darkError
        : AppColors.error;

    const borderRadius = BorderRadius.only(
      topLeft: Radius.circular(AppSpacing.radiusInput),
      topRight: Radius.circular(AppSpacing.radiusInput),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Stitch Label: Eyebrow uppercase tracking-widest in secondary color
        Text(
          label.toUpperCase(),
          style: AppTypography.labelExtraSmall.copyWith(
            color: isDarkMode ? AppColors.darkTextSecondary : AppColors.secondary,
          ),
        ),
        const SizedBox(height: 6),
        // Input Field with dynamic focus border and surface-container-low fill
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: keyboardType,
          readOnly: readOnly,
          obscureText: obscureText,
          onTap: onTap,
          validator: validator,
          style: AppTypography.bodyLarge.copyWith(
            color: theme.colorScheme.onSurface,
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: fillColor,
            hintText: placeholder,
            hintStyle: AppTypography.placeholder.copyWith(
              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.secondary,
            ),
            helperText: helperText,
            helperStyle: AppTypography.labelSmall.copyWith(
              color: isDarkMode ? AppColors.darkTextSecondary : AppColors.secondary,
            ),
            prefixIcon: prefixIcon,
            suffixIcon: suffixIcon,
            border: const UnderlineInputBorder(
              borderRadius: borderRadius,
              borderSide: BorderSide(width: 2),
            ),
            enabledBorder: UnderlineInputBorder(
              borderRadius: borderRadius,
              borderSide: BorderSide(
                color: baseBorderColor,
                width: 2,
              ),
            ),
            focusedBorder: UnderlineInputBorder(
              borderRadius: borderRadius,
              borderSide: BorderSide(
                color: focusBorderColor,
                width: 2,
              ),
            ),
            errorBorder: UnderlineInputBorder(
              borderRadius: borderRadius,
              borderSide: BorderSide(
                color: errorColor,
                width: 2,
              ),
            ),
            focusedErrorBorder: UnderlineInputBorder(
              borderRadius: borderRadius,
              borderSide: BorderSide(
                color: errorColor,
                width: 2,
              ),
            ),
            contentPadding: EdgeInsets.fromLTRB(
              16,
              maxLines > 1 ? 16 : 16,
              16,
              maxLines > 1 ? 16 : 16,
            ),
          ),
        ),
      ],
    );
  }
}
