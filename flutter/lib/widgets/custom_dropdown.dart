import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../config/app_colors.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';

/// CustomDropdown styled per "The Academic Curator" (Stitch):
/// - Fill: surface_container_low (#f3f3f5 in light theme)
/// - Bottom Indicator: 2px outline_variant (#dec0bb)
/// - Label: uppercase tracking-widest in secondary color
/// - Top corners: 12px rounded
class CustomDropdown<T> extends StatelessWidget {
  final String label;
  final String placeholder;
  final T? value;
  final List<DropdownMenuItem<T>> items;
  final void Function(T?)? onChanged;

  const CustomDropdown({
    super.key,
    required this.label,
    required this.placeholder,
    this.value,
    required this.items,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final bgColor = isDark
        ? AppColors.darkSurfaceContainerHigh
        : AppColors.surfaceContainerLow;
    final borderColor = isDark
        ? AppColors.darkBorderPrimary
        : AppColors.outlineVariant;
    final textColor = theme.colorScheme.onSurface;
    final hintColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.secondary;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Label (Stitch eyebrow)
        Text(
          label.toUpperCase(),
          style: AppTypography.labelExtraSmall.copyWith(
            color: isDark ? AppColors.darkTextSecondary : AppColors.secondary,
          ),
        ),
        const SizedBox(height: 6),
        // Dropdown
        Container(
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(AppSpacing.radiusInput),
              topRight: Radius.circular(AppSpacing.radiusInput),
            ),
            border: Border(
              bottom: BorderSide(
                color: borderColor,
                width: 2,
              ),
            ),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<T>(
              value: value,
              hint: Text(
                placeholder,
                style: AppTypography.bodyLarge.copyWith(
                  color: hintColor,
                ),
              ),
              isExpanded: true,
              icon: SvgPicture.asset(
                'assets/icons/dropdown_chevron.svg',
                width: 12,
                height: 7.4,
                colorFilter: ColorFilter.mode(
                  textColor,
                  BlendMode.srcIn,
                ),
              ),
              items: items,
              onChanged: onChanged,
              style: AppTypography.bodyLarge.copyWith(
                color: textColor,
              ),
              dropdownColor: bgColor,
            ),
          ),
        ),
      ],
    );
  }
}

