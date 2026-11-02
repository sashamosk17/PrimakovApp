/// Shows weekly schedule with lesson cards, live lesson status, and homework details
/// Apple Human Interface • Bento Grid 2.0 • Fluid Motion

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../config/app_colors.dart';
import '../../config/app_spacing.dart';
import '../../config/app_typography.dart';
import '../../models/api_models.dart';
import '../../providers/schedule_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/soft_offline_badge.dart';
import '../../widgets/notification_bell_icon.dart';
import 'lesson_detail_screen.dart';
import 'deadline_screen.dart';
import '../canteen_menu_screen.dart';

class ScheduleScreen extends ConsumerStatefulWidget {
  const ScheduleScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends ConsumerState<ScheduleScreen> {
  DateTime _selectedDate = DateTime.now();
  final List<DateTime> _weekDates = [];

  @override
  void initState() {
    super.initState();
    _generateWeekDates();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  void _generateWeekDates() {
    _weekDates.clear();
    final today = DateTime.now();
    final currentWeekday = today.weekday;
    final monday = today.subtract(Duration(days: currentWeekday - 1));

    for (int i = 0; i < 6; i++) {
      _weekDates.add(monday.add(Duration(days: i)));
    }
  }

  Future<void> _loadData() async {
    HapticFeedback.lightImpact();
    await _loadScheduleForDate(_selectedDate);
  }

  Future<void> _loadScheduleForDate(DateTime date) async {
    final userId = ref.read(authProvider).userId ?? 'user-1';
    final dateString = date.toIso8601String().split('T')[0];
    await ref.read(scheduleProvider.notifier).fetchSchedule(userId, dateString);
  }

  Future<void> _pickDate() async {
    HapticFeedback.selectionClick();
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2025),
      lastDate: DateTime(2027),
      locale: const Locale('ru', 'RU'),
      builder: (context, child) {
        final isDarkLocal = Theme.of(context).brightness == Brightness.dark;
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: isDarkLocal
                ? const ColorScheme.dark(
                    primary: AppColors.darkPrimary,
                    onPrimary: Colors.white,
                    surface: AppColors.darkSurface,
                  )
                : const ColorScheme.light(
                    primary: AppColors.primary,
                    onPrimary: Colors.white,
                    surface: Colors.white,
                  ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
      _loadScheduleForDate(picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheduleState = ref.watch(scheduleProvider);
    final schedule = scheduleState.currentSchedule;
    final scheduleLoading = scheduleState.isLoading;
    final scheduleError = scheduleState.error;

    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final scaffoldBg = isDark ? AppColors.darkBackgroundPrimary : AppColors.backgroundPrimary;
    final primaryColor = isDark ? AppColors.darkPrimary : AppColors.primary;

    return Scaffold(
      backgroundColor: scaffoldBg,
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: primaryColor,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Glassmorphic App Bar
            SliverAppBar(
              floating: true,
              pinned: false,
              backgroundColor: isDark
                  ? const Color(0xCC0E1116)
                  : const Color(0xE6F7F8FA),
              elevation: 0,
              flexibleSpace: ClipRect(
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                  child: Container(color: Colors.transparent),
                ),
              ),
              title: Text(
                'Расписание',
                style: TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.5,
                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                ),
              ),
              actions: [
                const NotificationBellIcon(),
                IconButton(
                  icon: Icon(Icons.calendar_month_rounded, color: primaryColor),
                  onPressed: _pickDate,
                ),
                const SizedBox(width: 8),
              ],
            ),

            // Offline Cache Badge
            if (scheduleState.isFromCache)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                  child: SoftOfflineBadge(
                    lastUpdated: scheduleState.lastCachedAt,
                    onRefresh: _loadData,
                  ),
                ),
              ),

            // Date Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 12, 18, 8),
                child: Row(
                  children: [
                    Text(
                      DateFormat('EEEE, d MMMM', 'ru').format(_selectedDate).toUpperCase(),
                      style: AppTypography.microBadge.copyWith(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                        letterSpacing: 1.2,
                        fontSize: 11,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkSurfaceContainerHighest : AppColors.surfaceContainerLow,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        '${schedule?.lessons.length ?? 0} уроков',
                        style: TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: primaryColor,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Interactive Week Days Selector
            SliverToBoxAdapter(
              child: Container(
                height: 84,
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _weekDates.length,
                  itemBuilder: (context, index) {
                    final date = _weekDates[index];
                    final isSelected = date.day == _selectedDate.day &&
                        date.month == _selectedDate.month &&
                        date.year == _selectedDate.year;
                    final isToday = date.day == DateTime.now().day &&
                        date.month == DateTime.now().month &&
                        date.year == DateTime.now().year;

                    return GestureDetector(
                      onTap: () {
                        HapticFeedback.selectionClick();
                        setState(() {
                          _selectedDate = date;
                        });
                        _loadScheduleForDate(date);
                      },
                      child: Container(
                        width: 58,
                        margin: const EdgeInsets.only(right: 10),
                        decoration: BoxDecoration(
                          gradient: isSelected
                              ? (isDark ? null : AppColors.primaryGradient)
                              : null,
                          color: isSelected
                              ? (isDark ? AppColors.darkPrimaryContainer : null)
                              : (isDark ? AppColors.darkBackgroundSecondary : Colors.white),
                          borderRadius: BorderRadius.circular(18),
                          border: isToday && !isSelected
                              ? Border.all(color: primaryColor, width: 1.5)
                              : Border.all(
                                  color: isSelected
                                      ? Colors.transparent
                                      : (isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder),
                                  width: 1,
                                ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: primaryColor.withOpacity(0.25),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  ),
                                ]
                              : (isDark ? AppColors.darkCardShadow : AppColors.cardShadow),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              DateFormat('EEE', 'ru').format(date).toUpperCase(),
                              style: TextStyle(
                                fontFamily: 'Manrope',
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: isSelected
                                    ? Colors.white.withOpacity(0.85)
                                    : (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                                letterSpacing: 0.8,
                              ),
                            ),
                            const SizedBox(height: 5),
                            Text(
                              '${date.day}',
                              style: TextStyle(
                                fontFamily: 'Manrope',
                                fontSize: 19,
                                fontWeight: FontWeight.w700,
                                letterSpacing: -0.4,
                                color: isSelected
                                    ? Colors.white
                                    : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
                              ),
                            ),
                            if (isToday)
                              Container(
                                margin: const EdgeInsets.only(top: 4),
                                width: 5,
                                height: 5,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: isSelected ? Colors.white : primaryColor,
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Content
            if (scheduleLoading)
              const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator()),
              )
            else if (scheduleError != null)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.error_outline_rounded,
                        size: 56,
                        color: Color(0xFFBA1A1A),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        scheduleError,
                        style: TextStyle(
                          color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadData,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryColor,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: const Text('Повторить'),
                      ),
                    ],
                  ),
                ),
              )
            else if (schedule == null || schedule.lessons.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkSurfaceContainerHigh : AppColors.surfaceContainerLow,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.event_busy_rounded,
                          size: 36,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Нет уроков на эту дату',
                        style: TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final lesson = schedule.lessons[index];

                      // Add big break after 2nd lesson
                      if (index == 2) {
                        return Column(
                          children: [
                            _LessonCard(
                              lesson: lesson,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (context) => LessonDetailScreen(lesson: lesson),
                                  ),
                                );
                              },
                            ),
                            const SizedBox(height: 14),
                            _BigBreakCard(),
                            const SizedBox(height: 14),
                          ],
                        );
                      }

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: _LessonCard(
                          lesson: lesson,
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (context) => LessonDetailScreen(lesson: lesson),
                              ),
                            );
                          },
                        ),
                      );
                    },
                    childCount: schedule.lessons.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _LessonCard extends StatelessWidget {
  final Lesson lesson;
  final VoidCallback onTap;

  const _LessonCard({
    required this.lesson,
    required this.onTap,
  });

  bool _isCurrentlyActive() {
    try {
      final now = DateTime.now();
      final nowMinutes = now.hour * 60 + now.minute;
      final startParts = lesson.startTime.split(':');
      final endParts = lesson.endTime.split(':');
      if (startParts.length >= 2 && endParts.length >= 2) {
        final start = int.parse(startParts[0]) * 60 + int.parse(startParts[1]);
        final end = int.parse(endParts[0]) * 60 + int.parse(endParts[1]);
        return nowMinutes >= start && nowMinutes <= end;
      }
    } catch (_) {}
    return false;
  }

  String _floorLabel(String room) {
    if (room.isNotEmpty && int.tryParse(room[0]) != null) {
      return '${room[0]} этаж • ';
    }
    return '';
  }

  void _showHomeworkDialog(BuildContext context) {
    HapticFeedback.lightImpact();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkBackgroundSecondary : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: isDark ? AppColors.darkFloatingShadow : AppColors.floatingShadow,
          ),
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white24 : Colors.black12,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkPastelRed : AppColors.pastelRed,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.assignment_rounded,
                      color: isDark ? AppColors.darkPrimary : AppColors.primary,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Домашнее задание',
                          style: TextStyle(
                            fontFamily: 'Manrope',
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.4,
                            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          lesson.subject,
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 13,
                            color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSurfaceContainerLow : AppColors.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  lesson.homeworkDescription != null && lesson.homeworkDescription!.isNotEmpty
                      ? lesson.homeworkDescription!
                      : 'Задание по теме урока «${lesson.subject}». Ознакомьтесь с материалами в электронном журнале.',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 14,
                    height: 1.5,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).pop();
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (context) => const DeadlineScreen()),
                    );
                  },
                  icon: const Icon(Icons.alarm_rounded, size: 18),
                  label: const Text('Перейти в дедлайны'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isDark ? AppColors.darkPrimary : AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final cardColor = isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;
    final primaryColor = isDark ? AppColors.darkPrimary : AppColors.primary;
    final isActive = _isCurrentlyActive();

    return Material(
      color: cardColor,
      borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
      child: InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          onTap();
        },
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
            border: Border.all(
              color: isActive
                  ? primaryColor.withOpacity(0.6)
                  : (isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder),
              width: isActive ? 1.5 : 1.0,
            ),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: primaryColor.withOpacity(0.12),
                      blurRadius: 18,
                      offset: const Offset(0, 6),
                    ),
                  ]
                : (isDark ? AppColors.darkCardShadow : AppColors.cardShadow),
          ),
          child: Row(
            children: [
              // Time Column
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    lesson.startTime,
                    style: TextStyle(
                      fontFamily: 'Manrope',
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.3,
                      color: isActive ? primaryColor : textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    lesson.endTime,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: textSecondary,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 14),

              // Divider Line
              Container(
                width: 3.5,
                height: 48,
                decoration: BoxDecoration(
                  gradient: isDark ? null : AppColors.primaryGradient,
                  color: isDark ? primaryColor : null,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 14),

              // Subject and Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            lesson.subject,
                            style: TextStyle(
                              fontFamily: 'Manrope',
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              letterSpacing: -0.3,
                              color: textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (isActive) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.darkPastelRed : AppColors.pastelRed,
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(
                                color: primaryColor.withOpacity(0.3),
                                width: 0.8,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: primaryColor,
                                    boxShadow: [
                                      BoxShadow(
                                        color: primaryColor.withOpacity(0.6),
                                        blurRadius: 4,
                                        spreadRadius: 1,
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'ИДЕТ',
                                  style: AppTypography.microBadge.copyWith(
                                    color: primaryColor,
                                    fontSize: 9.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        // Room & Floor Chip
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.darkSurfaceContainerHigh : AppColors.surfaceContainerLow,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.location_on_rounded,
                                color: isDark ? AppColors.darkPrimary : AppColors.primary,
                                size: 13,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${_floorLabel(lesson.room)}Каб. ${lesson.room}',
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Interactive Homework Chip
                        if (lesson.hasHomework) ...[
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () => _showHomeworkDialog(context),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 9,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: isDark ? AppColors.darkPastelRed : AppColors.pastelRed,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: primaryColor.withOpacity(0.2),
                                  width: 0.8,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.edit_note_rounded,
                                    size: 14,
                                    color: primaryColor,
                                  ),
                                  const SizedBox(width: 3),
                                  Text(
                                    'ДЗ',
                                    style: TextStyle(
                                      fontFamily: 'Manrope',
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: primaryColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),

              // Arrow
              Icon(
                Icons.arrow_forward_ios_rounded,
                size: 14,
                color: textSecondary.withOpacity(0.6),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BigBreakCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? AppColors.darkPastelAmber : AppColors.pastelAmber;
    const accentColor = Color(0xFFE65100);

    return Material(
      color: bgColor,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          Navigator.of(context).push(
            MaterialPageRoute(builder: (context) => const CanteenMenuScreen()),
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: accentColor.withOpacity(0.2),
              width: 1,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: accentColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.restaurant_rounded,
                  color: accentColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Большая перемена (20 мин)',
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: accentColor,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'В столовой свежая выпечка и горячие блюда',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 11.5,
                        color: Color(0xFFBF360C),
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.arrow_forward_ios_rounded,
                color: accentColor,
                size: 13,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
