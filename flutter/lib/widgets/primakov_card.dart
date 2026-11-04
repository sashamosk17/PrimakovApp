import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../config/app_colors.dart';
import '../config/app_spacing.dart';

/// PrimakovCard - Bento Grid 2.0 Card Component
/// Replaces default Material cards with an academic, minimalist aesthetic:
/// - Diffused ambient shadow (no harsh drop shadows)
/// - Sub-pixel ghost border (6% black / 10% white)
/// - Squircle 22px border radius
/// - Smooth tap scale & haptic feedback
/// - Optional staggered entry animation via flutter_animate
class PrimakovCard extends StatefulWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final Color? backgroundColor;
  final Color? borderColor;
  final double? borderRadius;
  final bool hasShadow;
  final bool animateEntrance;
  final int animationDelayMs;
  final Gradient? gradient;

  const PrimakovCard({
    Key? key,
    required this.child,
    this.padding = const EdgeInsets.all(AppSpacing.md),
    this.margin,
    this.onTap,
    this.onLongPress,
    this.backgroundColor,
    this.borderColor,
    this.borderRadius,
    this.hasShadow = true,
    this.animateEntrance = false,
    this.animationDelayMs = 0,
    this.gradient,
  }) : super(key: key);

  @override
  State<PrimakovCard> createState() => _PrimakovCardState();
}

class _PrimakovCardState extends State<PrimakovCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final radius = widget.borderRadius ?? AppSpacing.radiusCard;
    final radiusBorder = BorderRadius.circular(radius);

    final bg = widget.backgroundColor ??
        (isDark ? AppColors.darkSurfaceContainer : AppColors.surfaceContainerLowest);

    final borderCol = widget.borderColor ??
        (isDark ? AppColors.darkGhostBorder : AppColors.ghostBorder);

    final shadow = widget.hasShadow
        ? (isDark ? AppColors.darkCardShadow : AppColors.cardShadow)
        : null;

    Widget cardContent = AnimatedScale(
      scale: _isPressed ? 0.985 : 1.0,
      duration: const Duration(milliseconds: 120),
      curve: Curves.easeOutCubic,
      child: Container(
        margin: widget.margin,
        decoration: BoxDecoration(
          color: widget.gradient == null ? bg : null,
          gradient: widget.gradient,
          borderRadius: radiusBorder,
          border: Border.all(
            color: borderCol,
            width: 1,
          ),
          boxShadow: shadow,
        ),
        child: ClipRRect(
          borderRadius: radiusBorder,
          child: Material(
            color: Colors.transparent,
            child: widget.onTap != null || widget.onLongPress != null
                ? InkWell(
                    onTap: widget.onTap != null
                        ? () {
                            HapticFeedback.lightImpact();
                            widget.onTap!();
                          }
                        : null,
                    onLongPress: widget.onLongPress != null
                        ? () {
                            HapticFeedback.mediumImpact();
                            widget.onLongPress!();
                          }
                        : null,
                    onHighlightChanged: (highlighted) {
                      if (widget.onTap != null || widget.onLongPress != null) {
                        setState(() {
                          _isPressed = highlighted;
                        });
                      }
                    },
                    borderRadius: radiusBorder,
                    splashColor: isDark
                        ? const Color(0x1AFFFFFF)
                        : const Color(0x0A000000),
                    highlightColor: Colors.transparent,
                    child: Padding(
                      padding: widget.padding,
                      child: widget.child,
                    ),
                  )
                : Padding(
                    padding: widget.padding,
                    child: widget.child,
                  ),
          ),
        ),
      ),
    );

    if (widget.animateEntrance) {
      return cardContent
          .animate(delay: Duration(milliseconds: widget.animationDelayMs))
          .fadeIn(duration: 320.ms, curve: Curves.easeOutCubic)
          .slideY(begin: 0.06, end: 0, duration: 320.ms, curve: Curves.easeOutCubic);
    }

    return cardContent;
  }
}

