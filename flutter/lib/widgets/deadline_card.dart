/// Deadline Card Widget - Bento 2.0 Academic Style
/// Modern minimalist card with Lucide icons, ghost borders, and noble Primakov branding

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../config/app_colors.dart';
import '../models/api_models.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';
import 'primakov_card.dart';

class DeadlineCard extends StatelessWidget {
  final Deadline deadline;
  final VoidCallback? onComplete;

  const DeadlineCard({
    Key? key,
    required this.deadline,
    this.onComplete,
  }) : super(key: key);

  Color _getStatusColor() {
    if (deadline.status == DeadlineStatus.COMPLETED) {
      return AppColors.success;
    }

    try {
      final now = DateTime.now();
      final dueDate = DateTime.parse(deadline.dueDate);
      final daysLeft = dueDate.difference(now).inDays;

      if (daysLeft > 5) return AppColors.success;
      if (daysLeft >= 1) return AppColors.warning;
      return AppColors.error;
    } catch (_) {
      return AppColors.warning;
    }
  }

  String _getDaysLeftText() {
    if (deadline.status == DeadlineStatus.COMPLETED) {
      return 'СДАНО';
    }

    try {
      final now = DateTime.now();
      final dueDate = DateTime.parse(deadline.dueDate);
      final diff = dueDate.difference(now);
      final daysLeft = diff.inDays;

      if (daysLeft < 0) return 'ПРОСРОЧЕНО';
      if (daysLeft == 0) return 'СЕГОДНЯ';
      return '$daysLeft ДН.';
    } catch (_) {
      return 'СРОК';
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor();
    final daysLeftText = _getDaysLeftText();
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final isCompleted = deadline.status == DeadlineStatus.COMPLETED;

    final statusBg = isDarkMode
        ? statusColor.withOpacity(0.18)
        : statusColor.withOpacity(0.10);

    return PrimakovCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Title + Status Badge
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  deadline.title,
                  style: AppTypography.heading3.copyWith(
                    color: isDarkMode ? AppColors.darkTextPrimary : AppColors.onSurface,
                    decoration: isCompleted ? TextDecoration.lineThrough : null,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                  border: Border.all(
                    color: statusColor.withOpacity(0.25),
                    width: 0.8,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isCompleted
                          ? LucideIcons.checkCircle2
                          : (daysLeftText == 'ПРОСРОЧЕНО' ? LucideIcons.alertCircle : LucideIcons.clock),
                      size: 11,
                      color: statusColor,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      daysLeftText,
                      style: AppTypography.labelExtraSmall.copyWith(
                        color: statusColor,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          if (deadline.description.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              deadline.description,
              style: AppTypography.bodyMedium.copyWith(
                color: isDarkMode ? AppColors.darkTextSecondary : AppColors.secondary,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],

          // Subject if available
          if (deadline.subject != null && deadline.subject!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  LucideIcons.bookOpen,
                  size: 13,
                  color: isDarkMode ? AppColors.darkTextSecondary : AppColors.secondary,
                ),
                const SizedBox(width: 5),
                Text(
                  deadline.subject!,
                  style: AppTypography.bodySmall.copyWith(
                    color: isDarkMode ? AppColors.darkTextSecondary : AppColors.secondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: 12),

          // Footer: Date + Complete button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    LucideIcons.calendar,
                    size: 13,
                    color: isDarkMode ? AppColors.darkTextSecondary : AppColors.secondary,
                  ),
                  const SizedBox(width: 5),
                  Text(
                    'До: ${_formatDate(deadline.dueDate)}',
                    style: AppTypography.bodySmall.copyWith(
                      color: isDarkMode ? AppColors.darkTextSecondary : AppColors.secondary,
                    ),
                  ),
                ],
              ),
              if (!isCompleted && onComplete != null)
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () {
                      HapticFeedback.lightImpact();
                      onComplete!();
                    },
                    borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: isDarkMode
                            ? AppColors.darkPastelGreen
                            : AppColors.pastelGreen,
                        borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                        border: Border.all(
                          color: AppColors.success.withOpacity(0.3),
                          width: 0.8,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            LucideIcons.check,
                            size: 13,
                            color: AppColors.success,
                          ),
                          const SizedBox(width: 5),
                          Text(
                            'Выполнено',
                            style: AppTypography.labelSmall.copyWith(
                              color: AppColors.success,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final day = date.day.toString().padLeft(2, '0');
      final month = date.month.toString().padLeft(2, '0');
      return '$day.$month.${date.year}';
    } catch (_) {
      return dateStr;
    }
  }
}
