/// Lesson Card Widget
/// Converted from React Native LessonCard component

import 'package:flutter/material.dart';
import '../../config/app_colors.dart';
import '../models/api_models.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';

class LessonCard extends StatelessWidget {
  final Lesson lesson;

  const LessonCard({Key? key, required this.lesson}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    // 🔥 ЗАЩИТА ОТ NULL: используем значения по умолчанию
    final startTime = lesson.startTime.isNotEmpty ? lesson.startTime : '--:--';
    final endTime = lesson.endTime.isNotEmpty ? lesson.endTime : '--:--';
    final subject = lesson.subject.isNotEmpty ? lesson.subject : 'Без названия';
    final teacherName = lesson.teacherName ?? 'Преподаватель не указан';
    final room = lesson.room.isNotEmpty ? lesson.room : '?';
    final floor = lesson.floor;

    return Container(
      padding: AppSpacing.paddingMD,
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        border: Border(
          left: BorderSide(
            color: theme.colorScheme.primary,
            width: 4,
          ),
        ),
        color: theme.colorScheme.surface,
        borderRadius: AppSpacing.borderRadiusSM,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDarkMode ? 0.3 : 0.05),
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Time
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
            decoration: BoxDecoration(
              color: isDarkMode ? AppColors.darkBackgroundTertiary : AppColors.backgroundSecondary,
              borderRadius: BorderRadius.circular(AppSpacing.xs),
            ),
            child: Text(
              '$startTime - $endTime',
              style: AppTypography.bodySmall.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          // Subject
          Text(
            subject,
            style: AppTypography.heading3.copyWith(
              color: theme.colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          // Teacher Name
          Text(
            '👨‍🏫 $teacherName',
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          // Location
          Text(
            '🚪 Каб. $room, этаж $floor',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textTertiary,
            ),
          ),
          // Homework indicator
          if (lesson.hasHomework) ...[
            const SizedBox(height: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
              decoration: BoxDecoration(
                color: AppColors.warning.withOpacity(0.2),
                borderRadius: BorderRadius.circular(AppSpacing.xs),
              ),
              child: Text(
                '📝 Домашнее задание',
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.warning,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
