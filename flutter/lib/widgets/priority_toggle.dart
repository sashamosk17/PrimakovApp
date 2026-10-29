import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../config/app_colors.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';

/// PriorityToggle styled per "The Academic Curator" (Stitch):
/// - Tonal container (surface-container-low)
/// - 16px radius
/// - Primary red switch when active
class PriorityToggle extends StatelessWidget {
  final bool isHighPriority;
  final ValueChanged<bool> onChanged;

  const PriorityToggle({
    super.key,
    required this.isHighPriority,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final containerColor = isDark
        ? AppColors.darkSurfaceContainerHigh
        : AppColors.surfaceContainerLow;

    final trackColor = isHighPriority
        ? (isDark ? AppColors.darkPrimaryRed : AppColors.primary)
        : (isDark
            ? AppColors.darkSurfaceContainerHighest
            : AppColors.surfaceContainerHigh);

    final thumbColor = isDark
        ? AppColors.darkOnSurface
        : AppColors.surfaceContainerLowest;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: containerColor,
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Label with Icon
          Row(
            children: [
              SvgPicture.asset(
                'assets/icons/priority_icon.svg',
                width: 6,
                height: 18,
                colorFilter: isHighPriority
                    ? ColorFilter.mode(
                        isDark ? AppColors.darkPrimaryRed : AppColors.primary,
                        BlendMode.srcIn,
                      )
                    : null,
              ),
              const SizedBox(width: 12),
              Text(
                'Высокий приоритет',
                style: AppTypography.bodyMedium.copyWith(
                  color: theme.colorScheme.onSurface,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          // Toggle Switch (Pill shape)
          GestureDetector(
            onTap: () => onChanged(!isHighPriority),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 50,
              height: 28,
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: trackColor,
                borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
              ),
              child: Align(
                alignment:
                    isHighPriority ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    color: thumbColor,
                    shape: BoxShape.circle,
                    boxShadow: AppColors.toggleShadow,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

