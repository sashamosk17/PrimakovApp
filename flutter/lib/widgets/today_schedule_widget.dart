/// Today Schedule Widget for Home Screen
/// Shows today's schedule with next lesson highlighted

import 'package:flutter/material.dart';
import '../../config/app_colors.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/api_models.dart';
import '../providers/schedule_provider.dart';
import '../providers/auth_provider.dart';
import '../screens/main/schedule_screen.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';

class TodayScheduleWidget extends ConsumerStatefulWidget {
  const TodayScheduleWidget({Key? key}) : super(key: key);

  @override
  ConsumerState<TodayScheduleWidget> createState() => _TodayScheduleWidgetState();
}

class _TodayScheduleWidgetState extends ConsumerState<TodayScheduleWidget> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadTodaySchedule();
    });
  }

  Future<void> _loadTodaySchedule() async {
    final userId = ref.read(authProvider).userId ?? 'user-1';
    final today = DateTime.now();
    final dateString = today.toIso8601String().split('T')[0];
    await ref.read(scheduleProvider.notifier).fetchSchedule(userId, dateString);
  }

  @override
  Widget build(BuildContext context) {
    final schedule = ref.watch(currentScheduleProvider);
    final isLoading = ref.watch(scheduleLoadingProvider);

    if (isLoading) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        child: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (schedule == null || schedule.lessons.isEmpty) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        padding: AppSpacing.paddingLG,
        decoration: BoxDecoration(
          color: AppColors.backgroundSecondary,
          borderRadius: AppSpacing.borderRadiusLG,
          boxShadow: AppColors.toggleShadow,
        ),
        child: Center(
          child: Text(
            'Сегодня нет уроков',
            style: AppTypography.heading3.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
        ),
      );
    }

    // Find next lesson
    final now = DateTime.now();
    final currentTime = TimeOfDay(hour: now.hour, minute: now.minute);

    int? nextLessonIndex;
    for (int i = 0; i < schedule.lessons.length; i++) {
      final lesson = schedule.lessons[i];
      final lessonTime = _parseTime(lesson.startTime);
      if (lessonTime != null && _isAfter(lessonTime, currentTime)) {
        nextLessonIndex = i;
        break;
      }
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
                'Расписание на сегодня',
                style: AppTypography.heading1,
              ),
              TextButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => const ScheduleScreen(),
                    ),
                  );
                },
                child: Text(
                  'Полное расписание',
                  style: AppTypography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.primaryRed,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          // Lessons List (show max 3)
          ...schedule.lessons.take(3).toList().asMap().entries.map((entry) {
            final index = entry.key;
            final lesson = entry.value;
            final isNext = nextLessonIndex == index;
            return _LessonCompactCard(
              lesson: lesson,
              isNext: isNext,
            );
          }),
          if (schedule.lessons.length > 3)
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.sm),
              child: Center(
                child: Text(
                  'Еще ${schedule.lessons.length - 3} уроков',
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  TimeOfDay? _parseTime(String timeString) {
    try {
      final parts = timeString.split(':');
      if (parts.length >= 2) {
        return TimeOfDay(
          hour: int.parse(parts[0]),
          minute: int.parse(parts[1]),
        );
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  bool _isAfter(TimeOfDay time1, TimeOfDay time2) {
    if (time1.hour > time2.hour) return true;
    if (time1.hour == time2.hour && time1.minute > time2.minute) return true;
    return false;
  }
}

class _LessonCompactCard extends StatelessWidget {
  final Lesson lesson;
  final bool isNext;

  const _LessonCompactCard({
    required this.lesson,
    this.isNext = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: AppSpacing.paddingMD,
      decoration: BoxDecoration(
        color: isNext ? AppColors.storyBackground : AppColors.backgroundSecondary,
        borderRadius: AppSpacing.borderRadiusMD,
        border: isNext
            ? Border.all(color: AppColors.primaryRed, width: 2)
            : null,
        boxShadow: AppColors.toggleShadow,
      ),
      child: Row(
        children: [
          // Time
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                lesson.startTime,
                style: AppTypography.heading3.copyWith(
                  color: isNext ? AppColors.primaryRed : AppColors.textPrimary,
                ),
              ),
              Text(
                lesson.endTime,
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(width: AppSpacing.md),
          // Divider
          Container(
            width: 2,
            height: 40,
            color: isNext ? AppColors.primaryRed : AppColors.borderSecondary,
          ),
          const SizedBox(width: AppSpacing.md),
          // Subject and Room
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  lesson.subject,
                  style: AppTypography.heading3.copyWith(
                    color: isNext ? AppColors.primaryRed : AppColors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppSpacing.xs),
                Row(
                  children: [
                    Icon(Icons.location_on, size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: AppSpacing.xs),
                    Text(
                      'Кабинет ${lesson.room}',
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          // Next indicator
          if (isNext)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
              decoration: BoxDecoration(
                color: AppColors.primaryRed,
                borderRadius: BorderRadius.circular(AppSpacing.sm),
              ),
              child: Text(
                'Следующий',
                style: AppTypography.bodySmall.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.backgroundSecondary,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

