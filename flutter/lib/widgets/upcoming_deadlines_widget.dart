/// Upcoming Deadlines Widget for Home Screen
/// Shows 3-5 nearest deadlines with "View All" button

import 'package:flutter/material.dart';
import '../../config/app_colors.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../models/api_models.dart';
import '../providers/deadline_provider.dart';
import '../screens/main/deadline_screen.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';

class UpcomingDeadlinesWidget extends ConsumerWidget {
  const UpcomingDeadlinesWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pendingDeadlines = ref.watch(pendingDeadlinesProvider);
    final upcomingDeadlines = pendingDeadlines.take(5).toList();

    if (upcomingDeadlines.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Ближайшие дедлайны',
                style: AppTypography.heading1,
              ),
              TextButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => const DeadlineScreen(),
                    ),
                  );
                },
                child: Text(
                  'Смотреть все',
                  style: AppTypography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.primaryRed,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          // Deadlines List
          ...upcomingDeadlines.map((deadline) => _DeadlineCompactCard(
                deadline: deadline,
              )),
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
    final dueDate = DateTime.parse(deadline.dueDate);
    final dateFormat = DateFormat('d MMM', 'ru');
    final now = DateTime.now();
    final daysUntil = dueDate.difference(now).inDays;

    String urgencyText;
    Color urgencyColor;

    if (daysUntil == 0) {
      urgencyText = 'Сегодня';
      urgencyColor = AppColors.error;
    } else if (daysUntil == 1) {
      urgencyText = 'Завтра';
      urgencyColor = AppColors.warning;
    } else if (daysUntil <= 3) {
      urgencyText = 'Через $daysUntil дня';
      urgencyColor = AppColors.warning;
    } else {
      urgencyText = dateFormat.format(dueDate);
      urgencyColor = AppColors.textPrimary;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: AppSpacing.paddingMD,
      decoration: BoxDecoration(
        color: AppColors.backgroundSecondary,
        borderRadius: AppSpacing.borderRadiusMD,
        boxShadow: AppColors.toggleShadow,
      ),
      child: Row(
        children: [
          // Subject Badge
          if (deadline.subject != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
              decoration: BoxDecoration(
                color: AppColors.backgroundSecondary,
                borderRadius: BorderRadius.circular(AppSpacing.sm),
              ),
              child: Text(
                deadline.subject!.toUpperCase(),
                style: AppTypography.labelSmall.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                  letterSpacing: 1,
                ),
              ),
            ),
          const SizedBox(width: AppSpacing.md),
          // Title
          Expanded(
            child: Text(
              deadline.title,
              style: AppTypography.heading3.copyWith(
                fontSize: 15,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          // Due Date
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
            decoration: BoxDecoration(
              color: urgencyColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppSpacing.sm),
            ),
            child: Text(
              urgencyText,
              style: AppTypography.bodySmall.copyWith(
                fontWeight: FontWeight.bold,
                color: urgencyColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

