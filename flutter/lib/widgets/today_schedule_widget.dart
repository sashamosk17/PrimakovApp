/// Today Schedule Widget for Home Screen - Bento 2.0 Academic Style
/// Modern minimalist widget with Lucide icons, ghost borders, and noble Primakov branding

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../config/app_colors.dart';
import '../models/api_models.dart';
import '../providers/schedule_provider.dart';
import '../providers/auth_provider.dart';
import '../screens/main/schedule_screen.dart';
import '../config/app_spacing.dart';
import '../config/app_typography.dart';
import 'primakov_card.dart';

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
    final userId = ref.read(authProvider).userId;
    if (userId == null || userId.isEmpty) return;
    final today = DateTime.now();
    final dateString = today.toIso8601String().split('T')[0];
    await ref.read(scheduleProvider.notifier).fetchSchedule(userId, dateString);
  }

  @override
  Widget build(BuildContext context) {
    final schedule = ref.watch(currentScheduleProvider);
    final isLoading = ref.watch(scheduleLoadingProvider);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    if (isLoading) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        child: const Center(
          child: Padding(
            padding: EdgeInsets.all(24.0),
            child: CircularProgressIndicator(),
          ),
        ),
      );
    }

    if (schedule == null || schedule.lessons.isEmpty) {
      return PrimakovCard(
        margin: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Center(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                LucideIcons.calendarCheck,
                size: 20,
                color: isDark ? AppColors.darkTextSecondary : AppColors.secondary,
              ),
              const SizedBox(width: 10),
              Text(
                'Сегодня нет уроков',
                style: AppTypography.heading3.copyWith(
                  color: isDark ? AppColors.darkTextPrimary : AppColors.onSurface,
                ),
              ),
            ],
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
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Расписание на сегодня',
                style: AppTypography.heading2.copyWith(
                  color: isDark ? AppColors.darkTextPrimary : AppColors.onSurface,
                  fontSize: 20,
                ),
              ),
              TextButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => const ScheduleScreen(),
                    ),
                  );
                },
                icon: Icon(
                  LucideIcons.chevronRight,
                  size: 16,
                  color: isDark ? AppColors.darkPrimary : AppColors.primary,
                ),
                label: Text(
                  'Все уроки',
                  style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppColors.darkPrimary : AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          // Lessons List (show max 3)
          ...schedule.lessons.take(3).toList().asMap().entries.map((entry) {
            final index = entry.key;
            final lesson = entry.value;
            final isNext = nextLessonIndex == index;
            return _LessonCompactCard(
              lesson: lesson,
              isNext: isNext,
            ).animate(delay: Duration(milliseconds: 60 * index)).fadeIn(duration: 250.ms).slideY(begin: 0.05, end: 0);
          }),
          if (schedule.lessons.length > 3)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Center(
                child: Text(
                  'Еще ${schedule.lessons.length - 3} уроков',
                  style: AppTypography.bodySmall.copyWith(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.secondary,
                    fontWeight: FontWeight.w500,
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
    } catch (_) {}
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
    required this.isNext,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final primaryColor = isDark ? AppColors.darkPrimary : AppColors.primary;
    final primaryBg = isDark ? AppColors.darkPastelRed : AppColors.pastelRed;

    return PrimakovCard(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      backgroundColor: isNext
          ? primaryBg
          : (isDark ? AppColors.darkSurfaceContainer : AppColors.surfaceContainerLowest),
      borderColor: isNext ? primaryColor.withOpacity(0.4) : null,
      child: Row(
        children: [
          // Time Column
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                lesson.startTime,
                style: AppTypography.heading3.copyWith(
                  color: isNext
                      ? primaryColor
                      : (isDark ? AppColors.darkTextPrimary : AppColors.onSurface),
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                ),
              ),
              Text(
                lesson.endTime,
                style: AppTypography.bodySmall.copyWith(
                  color: isDark ? AppColors.darkTextSecondary : AppColors.secondary,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(width: 14),
          // Subtle vertical separator
          Container(
            width: 2,
            height: 36,
            decoration: BoxDecoration(
              color: isNext
                  ? primaryColor.withOpacity(0.5)
                  : (isDark ? AppColors.darkBorderSecondary : AppColors.outlineVariant.withOpacity(0.2)),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 14),
          // Subject and Room
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  lesson.subject,
                  style: AppTypography.heading3.copyWith(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.onSurface,
                    fontSize: 15,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Icon(
                      LucideIcons.mapPin,
                      size: 12,
                      color: isDark ? AppColors.darkTextSecondary : AppColors.secondary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Кабинет ${lesson.room}',
                      style: AppTypography.bodySmall.copyWith(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.secondary,
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
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: primaryColor,
                borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
              ),
              child: Text(
                'СЕЙЧАС',
                style: AppTypography.labelExtraSmall.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
