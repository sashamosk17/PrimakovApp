import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../config/app_colors.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';

/// GlassmorphicAppBar per Stitch "The Academic Curator" specification:
/// - Backdrop blur: 16px (10-20px range)
/// - Adaptive semi-transparent surface fill
/// - Accessible touch target of at least 48x48dp for navigation
/// - Manrope headline typography matching theme
class GlassmorphicAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final VoidCallback? onBackPressed;
  final Widget? trailing;

  const GlassmorphicAppBar({
    super.key,
    required this.title,
    this.onBackPressed,
    this.trailing,
  });

  @override
  Size get preferredSize => const Size.fromHeight(80);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final onSurfaceColor = theme.colorScheme.onSurface;

    final backgroundColor =
        isDark ? AppColors.darkGlassBackground : AppColors.glassBackground;

    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          color: backgroundColor,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: SafeArea(
            bottom: false,
            child: Row(
              children: [
                // Back Button with minimum 48x48dp touch target
                if (onBackPressed != null) ...[
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: onBackPressed,
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMD),
                      child: Container(
                        width: AppSpacing.minTouchTarget,
                        height: AppSpacing.minTouchTarget,
                        alignment: Alignment.center,
                        child: SvgPicture.asset(
                          'assets/icons/back_arrow.svg',
                          width: 16,
                          height: 16,
                          colorFilter: ColorFilter.mode(
                            onSurfaceColor,
                            BlendMode.srcIn,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
                // Title (Manrope)
                Expanded(
                  child: Text(
                    title,
                    style: AppTypography.heading1.copyWith(
                      color: onSurfaceColor,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                // Trailing Widget
                if (trailing != null) trailing!,
              ],
            ),
          ),
        ),
      ),
    );
  }
}
