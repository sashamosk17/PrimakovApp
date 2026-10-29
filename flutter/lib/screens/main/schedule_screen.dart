import '../../config/app_colors.dart';
/// Shows weekly schedule with lesson cards and navigation to lesson details

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../models/api_models.dart';
import '../../providers/schedule_provider.dart';
import '../../providers/auth_provider.dart';
import 'lesson_detail_screen.dart';

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
    await _loadScheduleForDate(_selectedDate);
  }

  Future<void> _loadScheduleForDate(DateTime date) async {
    final userId = ref.read(authProvider).userId ?? 'user-1';
    final dateString = date.toIso8601String().split('T')[0];
    await ref.read(scheduleProvider.notifier).fetchSchedule(userId, dateString);
  }

  Future<void> _pickDate() async {
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
                ? ColorScheme.dark(
                    primary: AppColors.darkPrimaryRed,
                    onPrimary: AppColors.darkOnPrimary,
                    surface: AppColors.darkSurface,
                  )
                : const ColorScheme.light(
                    primary: AppColors.primaryRed,
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
    final schedule = ref.watch(currentScheduleProvider);
    final scheduleLoading = ref.watch(scheduleLoadingProvider);
    final scheduleError = ref.watch(scheduleErrorProvider);

    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final scaffoldBg = isDark ? AppColors.darkBackgroundPrimary : AppColors.backgroundPrimary;
    final appBarBg = isDark ? AppColors.darkSurfaceContainerLow.withAlpha((0.9 * 255).round()) : const Color(0xCCF3F3F5);

    return Scaffold(
      backgroundColor: scaffoldBg,
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
          // App Bar
          SliverAppBar(
            floating: true,
            backgroundColor: appBarBg,
            elevation: 0,
            title: Text(
              'Расписание',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              ),
            ),
            actions: [
              IconButton(
                icon: Icon(Icons.calendar_today, color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed),
                onPressed: _pickDate,
              ),
            ],
          ),

          // Date Header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    DateFormat('MMMM yyyy', 'ru').format(_selectedDate),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _selectedDate = DateTime.now();
                      });
                      _loadScheduleForDate(DateTime.now());
                    },
                    child: Text(
                      'Сегодня',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Week Days Selector
          SliverToBoxAdapter(
            child: Container(
              height: 80,
              margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
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
                      setState(() {
                        _selectedDate = date;
                      });
                      _loadScheduleForDate(date);
                    },
                    child: Builder(
                      builder: (context) {
                        final isDarkLocal = Theme.of(context).brightness == Brightness.dark;
                        final primaryColor = isDarkLocal ? AppColors.darkPrimaryRed : AppColors.primaryRed;
                        final cardBg = isSelected
                            ? primaryColor
                            : (isDarkLocal ? AppColors.darkBackgroundSecondary : Colors.white);
                        final textColor = isSelected
                            ? Colors.white
                            : (isDarkLocal ? AppColors.darkTextPrimary : AppColors.textPrimary);
                        return Container(
                          width: 60,
                          margin: const EdgeInsets.only(right: 12),
                          decoration: BoxDecoration(
                            color: cardBg,
                            borderRadius: BorderRadius.circular(16),
                            border: isToday && !isSelected
                                ? Border.all(color: primaryColor, width: 2)
                                : null,
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x08000000),
                                blurRadius: 8,
                                offset: Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                DateFormat('EEE', 'ru').format(date).toUpperCase(),
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white70 : textColor,
                                  letterSpacing: 1,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${date.day}',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: textColor,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
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
                      Icons.error_outline,
                      size: 64,
                      color: Color(0xFFD32F2F),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      scheduleError,
                      style: TextStyle(color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadData,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
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
                    Icon(
                      Icons.event_busy,
                      size: 64,
                      color: isDark ? AppColors.darkIconGray : Colors.grey[400],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Нет уроков на эту дату',
                      style: TextStyle(
                        fontSize: 16,
                        color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
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
                          const SizedBox(height: 16),
                          _BigBreakCard(),
                          const SizedBox(height: 16),
                        ],
                      );
                    }

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final cardColor = isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;
    final primaryColor = isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed;
    final hwBg = isDark ? AppColors.darkStoryBackground : const Color(0xFFFFEBEE);
    final hwText = isDark ? AppColors.darkPrimary : const Color(0xFFD32F2F);

    return Material(
      color: cardColor,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: isDark ? Border.all(color: AppColors.darkBorderPrimary) : null,
            boxShadow: isDark ? null : const [
              BoxShadow(
                color: Color(0x08000000),
                blurRadius: 10,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              // Time
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    lesson.startTime,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  Text(
                    lesson.endTime,
                    style: TextStyle(color: textSecondary),
                  ),
                ],
              ),
              const SizedBox(width: 16),
              // Divider
              Container(
                width: 3,
                height: 50,
                decoration: BoxDecoration(
                  color: primaryColor,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 16),
              // Subject and Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lesson.subject,
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.location_on, color: textSecondary, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          'Кабинет ${lesson.room}',
                          style: TextStyle(color: textSecondary),
                        ),
                        if (lesson.hasHomework) ...[
                          const SizedBox(width: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: hwBg,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'ДЗ',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: hwText,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              // Arrow
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: textSecondary,
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
    final bgColor = isDark ? const Color(0xFF2A2200) : const Color(0xFFFFF3E0);
    final borderColor = const Color(0xFFFF6F00);
    const accentColor = Color(0xFFFF6F00);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: const Row(
        children: [
          Icon(Icons.free_breakfast, color: accentColor),
          SizedBox(width: 12),
          Text(
            'Большая перемена',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: accentColor,
            ),
          ),
        ],
      ),
    );
  }
}



