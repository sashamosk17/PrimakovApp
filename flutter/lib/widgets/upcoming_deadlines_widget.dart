/// Upcoming Deadlines Widget for Home Screen - Bento 2.0 Academic Style
/// Modern minimalist widget with Lucide icons, ghost borders, and noble Primakov branding

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../config/app_colors.dart';
import '../models/api_models.dart';
import '../providers/deadline_provider.dart';
import '../screens/main/deadline_screen.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';
import 'primakov_card.dart';

class UpcomingDeadlinesWidget extends ConsumerWidget {
  const UpcomingDeadlinesWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pendingDeadlines = ref.watch(pendingDeadlinesProvider);
    final upcomingDeadlines = pendingDeadlines.take(5).toList();
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    if (upcomingDeadlines.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Ближайшие дедлайны',
                style: AppTypography.heading2.copyWith(
                  color: isDark ? AppColors.darkTextPrimary : AppColors.onSurface,
                  fontSize: 20,
                ),
              ),
              TextButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => const DeadlineScreen(),
                    ),
                  );
                },
                icon: Icon(
                  LucideIcons.chevronRight,
                  size: 16,
                  color: isDark ? AppColors.darkPrimary : AppColors.primary,
                ),
                label: Text(
                  'Смотреть все',
                  style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppColors.darkPrimary : AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          // Deadlines List
          ...upcomingDeadlines.asMap().entries.map((entry) {
            final index = entry.key;
            final deadline = entry.value;
            return _DeadlineCompactCard(
              deadline: deadline,
            ).animate(delay: Duration(milliseconds: 60 * index)).fadeIn(duration: 250.ms).slideY(begin: 0.05, end: 0);
          }),
        ],
      ),
    );
  }
}

class _DeadlineCompactCard extends StatelessWidget {
  final Deadline deadline;

  const _DeadlineCompactCard({
    required this.deadline,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    DateTime? dueDate;
    try {
      dueDate = DateTime.parse(deadline.dueDate);
    } catch (_) {}

    final dateFormat = DateFormat('d MMM', 'ru');
    final now = DateTime.now();
    final daysUntil = dueDate != null ? dueDate.difference(now).inDays : 0;

    String urgencyText;
    Color urgencyColor;

    if (daysUntil < 0) {
      urgencyText = 'ПРОСРОЧЕНО';
      urgencyColor = AppColors.error;
    } else if (daysUntil == 0) {
      urgencyText = 'СЕГОДНЯ';
      urgencyColor = AppColors.error;
    } else if (daysUntil == 1) {
      urgencyText = 'ЗАВТРА';
      urgencyColor = AppColors.warning;
    } else if (daysUntil <= 3) {
      urgencyText = '$daysUntil ДНЯ';
      urgencyColor = AppColors.warning;
    } else {
      urgencyText = dueDate != null ? dateFormat.format(dueDate).toUpperCase() : 'СРОК';
      urgencyColor = isDark ? AppColors.darkTextSecondary : AppColors.secondary;
    }

    return PrimakovCard(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          // Icon
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurfaceContainerHigh : AppColors.surfaceContainerLow,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              LucideIcons.calendarClock,
              size: 16,
              color: isDark ? AppColors.darkPrimary : AppColors.primary,
            ),
          ),
          const SizedBox(width: 12),
          // Title & Subject
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  deadline.title,
                  style: AppTypography.heading3.copyWith(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.onSurface,
                    fontSize: 14,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (deadline.subject != null && deadline.subject!.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    deadline.subject!,
                    style: AppTypography.bodySmall.copyWith(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.secondary,
                      fontSize: 11,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 10),
          // Due Date Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: urgencyColor.withOpacity(isDark ? 0.2 : 0.1),
              borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
              border: Border.all(
                color: urgencyColor.withOpacity(0.3),
                width: 0.8,
              ),
            ),
            child: Text(
              urgencyText,
              style: AppTypography.labelExtraSmall.copyWith(
                fontWeight: FontWeight.w700,
                color: urgencyColor,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
