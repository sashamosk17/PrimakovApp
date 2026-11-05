/// Home Screen - Main Dashboard
/// Redesigned with Bento Grid layout, Stories section, and modern UI

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../config/app_colors.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../providers/story_provider.dart';
import '../../providers/deadline_provider.dart';
import '../../providers/schedule_provider.dart';
import '../../providers/announcement_provider.dart';
import '../../providers/canteen_provider.dart';
import '../../models/api_models.dart';
import '../../config/app_spacing.dart';
import '../../config/app_typography.dart';
import 'schedule_screen.dart';
import 'deadline_screen.dart';
import 'story_viewer_screen.dart';
import '../canteen_menu_screen.dart';
import 'grades_screen.dart';
import 'boarding_screen.dart';
import '../../providers/grades_provider.dart';
import '../../providers/boarding_provider.dart';
import '../../widgets/notification_bell_icon.dart';
import '../../config/app_localizations.dart';
import '../../providers/locale_provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../announcements_screen.dart';

final quoteProvider = Provider<Quote>((ref) {
  return Quote(
    id: '1',
    text: 'Учиться побеждать, оставаясь человеком — главная цель гимназиста.',
    author: 'Гимназия им. Е.М. Примакова',
  );
});

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  Future<void> _loadData() async {
    final userId = ref.read(authProvider).userId ?? 'user-1';

    // Load stories
    ref.read(storyProvider.notifier).fetchStories();

    // Load deadlines
    ref.read(deadlineProvider.notifier).fetchDeadlines(userId);

    // Load today's schedule
    final today = DateTime.now();
    final dateString = today.toIso8601String().split('T')[0];
    ref.read(scheduleProvider.notifier).fetchSchedule(userId, dateString);

    // Load announcements & canteen menu from API
    ref.read(announcementProvider.notifier).fetchAnnouncements();
    ref.read(canteenProvider.notifier).fetchTodayMenu();

    // Load academic grades & boarding status
    ref.read(gradesProvider.notifier).loadGrades();
    ref.read(boardingProvider.notifier).loadStatus();
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);
    final currentUser = ref.watch(currentUserProvider);
    final userName = currentUser != null
        ? '${currentUser.lastName} ${currentUser.firstName}'
        : '';
    final userRole = currentUser != null ? _roleLabel(currentUser.role, loc) : '';

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackgroundPrimary : AppColors.backgroundPrimary,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
          child: CustomScrollView(
            slivers: [
              // Top App Bar
              SliverToBoxAdapter(
                child: _buildTopAppBar(userName, userRole, currentUser, loc),
              ),

              // Dynamic Day Glance (Contextual Card)
              SliverToBoxAdapter(
                child: _buildDynamicDayGlance(),
              ),

              // Stories Section
              SliverToBoxAdapter(
                child: _buildStoriesSection(),
              ),

              // Bento Grid Content
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 8),
                sliver: SliverToBoxAdapter(
                  child: Column(
                    children: [
                      // Row 1: Schedule Hero Card (full width)
                      _buildScheduleCard()
                          .animate()
                          .fadeIn(duration: 300.ms, delay: 40.ms)
                          .slideY(begin: 0.05, end: 0, curve: Curves.easeOutCubic),
                      const SizedBox(height: AppSpacing.md),

                      // Row 2: Deadlines + Cafeteria (2-column Bento)
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: _buildDeadlinesCard(),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: _buildCafeteriaCard(),
                          ),
                        ],
                      )
                          .animate()
                          .fadeIn(duration: 300.ms, delay: 80.ms)
                          .slideY(begin: 0.05, end: 0, curve: Curves.easeOutCubic),
                      const SizedBox(height: AppSpacing.md),

                      // Row 2.5: Academic GPA Simulator Bento Card
                      _buildAcademicGpaCard()
                          .animate()
                          .fadeIn(duration: 300.ms, delay: 120.ms)
                          .slideY(begin: 0.05, end: 0, curve: Curves.easeOutCubic),
                      const SizedBox(height: AppSpacing.md),

                      // Optional Row: Boarding Life Widget (for boarding students)
                      if (currentUser?.isBoarding == true) ...[
                        _buildBoardingHomeWidget()
                            .animate()
                            .fadeIn(duration: 300.ms, delay: 160.ms)
                            .slideY(begin: 0.05, end: 0, curve: Curves.easeOutCubic),
                        const SizedBox(height: AppSpacing.md),
                      ],

                      // Row 3: News Carousel (full width)
                      _buildNewsCard()
                          .animate()
                          .fadeIn(duration: 300.ms, delay: 200.ms)
                          .slideY(begin: 0.05, end: 0, curve: Curves.easeOutCubic),
                      const SizedBox(height: AppSpacing.md),

                      // Row 4: Quote Card
                      _buildQuoteCard()
                          .animate()
                          .fadeIn(duration: 300.ms, delay: 240.ms)
                          .slideY(begin: 0.05, end: 0, curve: Curves.easeOutCubic),

                      // Spacing for Floating Frosted BottomBar
                      const SizedBox(height: 90),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _roleLabel(UserRole role, AppLocalizations loc) {
    switch (role) {
      case UserRole.STUDENT:
        return loc.roleStudent;
      case UserRole.TEACHER:
        return loc.roleTeacher;
      case UserRole.ADMIN:
        return loc.roleAdmin;
    }
  }

  String _initials(String? firstName, String? lastName) {
    final f = (firstName?.isNotEmpty == true) ? firstName![0].toUpperCase() : '';
    final l = (lastName?.isNotEmpty == true) ? lastName![0].toUpperCase() : '';
    return '$l$f';
  }

  Widget _buildTopAppBar(String userName, String userRole, User? currentUser, AppLocalizations loc) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final initials = _initials(currentUser?.firstName, currentUser?.lastName);
    final group = currentUser?.groupName;
    final roleWithClass = (group != null && group.isNotEmpty)
        ? '$group • $userRole'
        : userRole;

    return Container(
      padding: const EdgeInsets.fromLTRB(AppSpacing.md + 4, AppSpacing.md, AppSpacing.md + 4, 10),
      child: Row(
        children: [
          // Noble Squircle Avatar
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: isDark ? null : AppColors.primaryGradient,
              color: isDark ? AppColors.darkPrimaryContainer : null,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark ? const Color(0x33FFFFFF) : const Color(0x1A8B0000),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: isDark
                      ? Colors.black.withOpacity(0.3)
                      : AppColors.primary.withOpacity(0.18),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Center(
              child: Text(
                initials.isNotEmpty ? initials : 'ГП',
                style: const TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          // Name and Role
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  userName.isNotEmpty ? userName : loc.translate('gymnasist'),
                  style: TextStyle(
                    fontFamily: 'Manrope',
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.5,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  roleWithClass,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const NotificationBellIcon(),
          const SizedBox(width: 10),
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurfaceContainerHigh : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder,
                width: 0.8,
              ),
            ),
            child: Opacity(
              opacity: 0.9,
              child: Image.asset(
                'assets/images/primakov_logo.png',
                width: 22,
                height: 22,
                fit: BoxFit.contain,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDynamicDayGlance() {
    final loc = AppLocalizations.of(context);
    final schedule = ref.watch(currentScheduleProvider);
    final deadlines = ref.watch(allDeadlinesProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final now = DateTime.now();
    final nowMinutes = now.hour * 60 + now.minute;

    String badgeText = loc.badgeNow;
    Color badgeColor = isDark ? AppColors.darkPrimary : AppColors.primary;
    Color badgeBg = isDark ? AppColors.darkPastelRed : AppColors.pastelRed;
    IconData icon = LucideIcons.clock;
    String headline = loc.translate('appName');
    String detail = 'Primakov Gymnasium';
    VoidCallback? onTap;

    final lessons = schedule?.lessons ?? [];
    if (now.weekday == DateTime.sunday) {
      badgeText = loc.badgeWeekend;
      badgeColor = isDark ? const Color(0xFF64B5F6) : const Color(0xFF1976D2);
      badgeBg = isDark ? AppColors.darkPastelBlue : AppColors.pastelBlue;
      icon = LucideIcons.coffee;
      headline = loc.weekendTitle;
      detail = loc.weekendSubtitle;
    } else if (lessons.isEmpty) {
      final activeDeadlines = deadlines.where((d) => d.status == DeadlineStatus.PENDING).length;
      badgeText = loc.badgeDay;
      badgeColor = isDark ? const Color(0xFF81C784) : const Color(0xFF2E7D32);
      badgeBg = isDark ? AppColors.darkPastelGreen : AppColors.pastelGreen;
      icon = LucideIcons.calendar;
      headline = loc.noLessonsTodayTitle;
      detail = activeDeadlines > 0
          ? '$activeDeadlines ${loc.translate('activeDeadlinesCount')} • ${loc.translate('checkDeadlines')}'
          : loc.freeSchedule;
      if (activeDeadlines > 0) {
        onTap = () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (context) => const DeadlineScreen()),
          );
        };
      }
    } else {
      Lesson? currentLesson;
      Lesson? nextLesson;
      Lesson? firstLesson = lessons.first;
      int? minutesUntilNext;
      int? minutesUntilEnd;

      for (int i = 0; i < lessons.length; i++) {
        final l = lessons[i];
        final startT = _parseTime(l.startTime);
        final endT = _parseTime(l.endTime);
        if (startT != null && endT != null) {
          final startMinutes = startT.hour * 60 + startT.minute;
          final endMinutes = endT.hour * 60 + endT.minute;

          if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
            currentLesson = l;
            minutesUntilEnd = endMinutes - nowMinutes;
            break;
          } else if (nowMinutes < startMinutes) {
            nextLesson = l;
            minutesUntilNext = startMinutes - nowMinutes;
            break;
          }
        }
      }

      final firstT = _parseTime(firstLesson.startTime);
      final firstStartMinutes = firstT != null ? firstT.hour * 60 + firstT.minute : 510;

      if (nowMinutes < firstStartMinutes && nextLesson != null) {
        badgeText = loc.badgeSoon;
        badgeColor = isDark ? const Color(0xFFFFB74D) : const Color(0xFFE65100);
        badgeBg = isDark ? AppColors.darkPastelAmber : AppColors.pastelAmber;
        icon = LucideIcons.sun;
        final mins = minutesUntilNext ?? (firstStartMinutes - nowMinutes);
        headline = '${loc.translate('untilFirstLesson')} ${mins > 0 ? '$mins ${loc.translate('minutesShort')}' : loc.translate('lessThanMinute')}';
        detail = '${nextLesson.subject} • ${loc.room} ${nextLesson.room}';
        onTap = () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (context) => const ScheduleScreen()),
          );
        };
      } else if (currentLesson != null) {
        badgeText = loc.badgeInProgress;
        badgeColor = isDark ? const Color(0xFFFF8A80) : AppColors.primaryRed;
        badgeBg = isDark ? AppColors.darkPastelRed : AppColors.pastelRed;
        icon = LucideIcons.bookOpen;
        headline = currentLesson.subject;
        final mins = minutesUntilEnd ?? 10;
        detail = '${loc.room} ${currentLesson.room} • ${loc.translate('untilLessonEnd')} $mins ${loc.translate('minutesShort')}';
        onTap = () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (context) => const ScheduleScreen()),
          );
        };
      } else if (nextLesson != null) {
        badgeText = loc.badgeBreak;
        badgeColor = isDark ? const Color(0xFFFFB74D) : const Color(0xFFE65100);
        badgeBg = isDark ? AppColors.darkPastelAmber : AppColors.pastelAmber;
        icon = LucideIcons.utensils;
        final mins = minutesUntilNext ?? 15;
        headline = '${loc.translate('bigRecess')} ($mins ${loc.translate('minutesShort')})';
        detail = '${loc.translate('nextLesson')}: ${nextLesson.subject} (${loc.room} ${nextLesson.room}) • ${loc.translate('canteenMenuNav')}';
        onTap = () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (context) => const CanteenMenuScreen()),
          );
        };
      } else {
        final activeDeadlines = deadlines.where((d) => d.status == DeadlineStatus.PENDING).length;
        badgeText = loc.badgeFinished;
        badgeColor = isDark ? const Color(0xFF9FA8DA) : const Color(0xFF3F51B5);
        badgeBg = isDark ? AppColors.darkPastelIndigo : AppColors.pastelIndigo;
        icon = LucideIcons.moon;
        headline = loc.schoolDayOver;
        detail = activeDeadlines > 0
            ? '$activeDeadlines ${loc.translate('activeDeadlinesCount')} • ${loc.translate('checkDeadlines')}'
            : loc.goodJobToday;
        onTap = () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (context) => const DeadlineScreen()),
          );
        };
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 6),
      child: Material(
        color: isDark ? AppColors.darkSurfaceContainerHigh : Colors.white,
        borderRadius: BorderRadius.circular(AppSpacing.radiusXL),
        child: InkWell(
          onTap: onTap != null
              ? () {
                  HapticFeedback.lightImpact();
                  onTap!();
                }
              : null,
          borderRadius: BorderRadius.circular(AppSpacing.radiusXL),
          child: Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppSpacing.radiusXL),
              border: Border.all(
                color: isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder,
                width: 1.0,
              ),
              boxShadow: isDark ? AppColors.darkCardShadow : AppColors.cardShadow,
            ),
            child: Row(
              children: [
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    color: badgeBg,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(
                    icon,
                    color: badgeColor,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: badgeBg,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              badgeText,
                              style: AppTypography.microBadge.copyWith(
                                color: badgeColor,
                                fontSize: 10,
                              ),
                            ),
                          ),
                          const Spacer(),
                          if (onTap != null)
                            Icon(
                              LucideIcons.chevronRight,
                              size: 15,
                              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                            ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        headline,
                        style: TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.4,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        detail,
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 12.5,
                          fontWeight: FontWeight.w400,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStoriesSection() {
    final stories = ref.watch(allStoriesProvider);
    final userId = ref.watch(authProvider).userId ?? '';

    final displayStories = stories.isEmpty
        ? [
            Story(
              id: '1',
              title: 'События',
              description: 'Новые события',
              imageUrl: null,
              videoUrl: null,
              viewedBy: [],
            ),
            Story(
              id: '2',
              title: 'Приказы',
              description: 'Важные приказы',
              imageUrl: null,
              videoUrl: null,
              viewedBy: [],
            ),
            Story(
              id: '3',
              title: 'Меню',
              description: 'Меню столовой',
              imageUrl: null,
              videoUrl: null,
              viewedBy: ['viewed'],
            ),
            Story(
              id: '4',
              title: 'Оценки',
              description: 'Ваши оценки',
              imageUrl: null,
              videoUrl: null,
              viewedBy: ['viewed'],
            ),
            Story(
              id: '5',
              title: 'Разное',
              description: 'Разное',
              imageUrl: null,
              videoUrl: null,
              viewedBy: [],
            ),
          ]
        : stories;

    return Container(
      height: 114,
      margin: const EdgeInsets.only(top: 8, bottom: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: displayStories.length,
        itemBuilder: (context, index) {
          final story = displayStories[index];
          final isViewed = story.viewedBy.contains(userId) || story.viewedBy.contains('viewed');
          return _buildStoryItem(story, isViewed);
        },
      ),
    );
  }

  Widget _buildStoryItem(Story story, bool isViewed) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        final stories = ref.read(allStoriesProvider);
        final displayStories = stories.isEmpty
            ? [
                Story(
                  id: '1',
                  title: 'События',
                  description: 'Новые события',
                  imageUrl: null,
                  videoUrl: null,
                  viewedBy: [],
                ),
                Story(
                  id: '2',
                  title: 'Приказы',
                  description: 'Важные приказы',
                  imageUrl: null,
                  videoUrl: null,
                  viewedBy: [],
                ),
                Story(
                  id: '3',
                  title: 'Меню',
                  description: 'Меню столовой',
                  imageUrl: null,
                  videoUrl: null,
                  viewedBy: ['viewed'],
                ),
                Story(
                  id: '4',
                  title: 'Оценки',
                  description: 'Ваши оценки',
                  imageUrl: null,
                  videoUrl: null,
                  viewedBy: ['viewed'],
                ),
                Story(
                  id: '5',
                  title: 'Разное',
                  description: 'Разное',
                  imageUrl: null,
                  videoUrl: null,
                  viewedBy: [],
                ),
              ]
            : stories;

        final initialIndex = displayStories.indexWhere((s) => s.id == story.id);

        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => StoryViewerScreen(
              stories: displayStories,
              initialIndex: initialIndex >= 0 ? initialIndex : 0,
            ),
          ),
        );
      },
      child: Container(
        width: 74,
        margin: const EdgeInsets.only(right: 14),
        child: Column(
          children: [
            Container(
              width: 66,
              height: 66,
              padding: const EdgeInsets.all(2.5),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: isViewed ? null : AppColors.storyGradientRing,
                color: isViewed
                    ? (isDark ? AppColors.darkBorderPrimary : const Color(0xFFE2E4E8))
                    : null,
                boxShadow: isViewed
                    ? null
                    : [
                        const BoxShadow(
                          color: Color(0x33BA1A1A),
                          blurRadius: 10,
                          offset: Offset(0, 3),
                        ),
                      ],
              ),
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isDark ? AppColors.darkBackgroundPrimary : AppColors.surface,
                ),
                child: ClipOval(
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isViewed
                          ? (isDark ? AppColors.darkSurfaceVariant : Colors.grey.shade200)
                          : (isDark ? AppColors.darkPastelRed : AppColors.storyBackground),
                    ),
                    child: story.imageUrl != null && story.imageUrl!.isNotEmpty
                        ? Image.asset(
                            story.imageUrl!,
                            width: 56,
                            height: 56,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Icon(
                                _getStoryIcon(story.title),
                                color: isViewed
                                    ? (isDark ? AppColors.darkIconGray : Colors.grey.shade400)
                                    : (isDark ? AppColors.darkPrimary : AppColors.primaryRed),
                                size: 26,
                              );
                            },
                          )
                        : Icon(
                            _getStoryIcon(story.title),
                            color: isViewed
                                ? (isDark ? AppColors.darkIconGray : Colors.grey.shade400)
                                : (isDark ? AppColors.darkPrimary : AppColors.primaryRed),
                            size: 26,
                          ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              story.title,
              style: TextStyle(
                fontFamily: 'Manrope',
                fontSize: 11,
                color: isViewed
                    ? (isDark ? AppColors.darkTextSecondary : const Color(0xFF7E848D))
                    : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
                fontWeight: isViewed ? FontWeight.w500 : FontWeight.w700,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  IconData _getStoryIcon(String title) {
    switch (title.toLowerCase()) {
      case 'события':
        return LucideIcons.calendar;
      case 'приказы':
        return LucideIcons.fileText;
      case 'меню':
        return LucideIcons.utensils;
      case 'оценки':
        return LucideIcons.graduationCap;
      case 'разное':
        return LucideIcons.moreHorizontal;
      default:
        return LucideIcons.circle;
    }
  }

  Widget _buildScheduleCard() {
    final loc = AppLocalizations.of(context);
    final schedule = ref.watch(currentScheduleProvider);
    final isLoading = ref.watch(scheduleLoadingProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Lesson? nextLesson;
    if (schedule != null && schedule.lessons.isNotEmpty) {
      final now = DateTime.now();
      final currentTime = TimeOfDay(hour: now.hour, minute: now.minute);

      for (final lesson in schedule.lessons) {
        final lessonTime = _parseTime(lesson.startTime);
        if (lessonTime != null && _isAfter(lessonTime, currentTime)) {
          nextLesson = lesson;
          break;
        }
      }
      nextLesson ??= schedule.lessons.first;
    }

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary,
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        border: Border.all(
          color: isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder,
          width: 1,
        ),
        boxShadow: isDark ? AppColors.darkCardShadow : AppColors.cardShadow,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        child: InkWell(
          onTap: () {
            HapticFeedback.lightImpact();
            Navigator.of(context).push(
              MaterialPageRoute(builder: (context) => const ScheduleScreen()),
            );
          },
          borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkPastelIndigo : AppColors.pastelIndigo,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(
                        LucideIcons.calendar,
                        color: isDark ? const Color(0xFF9FA8DA) : const Color(0xFF3F51B5),
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            loc.translate('navSchedule').toUpperCase(),
                            style: AppTypography.microBadge.copyWith(
                              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                            ),
                          ),
                          Text(
                            loc.mySchedule,
                            style: TextStyle(
                              fontFamily: 'Manrope',
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                              letterSpacing: -0.4,
                              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkSurfaceContainerHighest : AppColors.surfaceContainerLow,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            loc.allLessons,
                            style: TextStyle(
                              fontFamily: 'Manrope',
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: isDark ? AppColors.darkPrimary : AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Icon(
                            LucideIcons.arrowRight,
                            size: 13,
                            color: isDark ? AppColors.darkPrimary : AppColors.primary,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (isLoading)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: CircularProgressIndicator(),
                    ),
                  )
                else if (nextLesson != null)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurfaceContainerLow : AppColors.surfaceContainerLow,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder,
                        width: 0.8,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 4,
                          height: 48,
                          decoration: BoxDecoration(
                            gradient: isDark ? null : AppColors.primaryGradient,
                            color: isDark ? AppColors.darkPrimary : null,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    nextLesson.startTime,
                                    style: TextStyle(
                                      fontFamily: 'Manrope',
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: isDark ? AppColors.darkPrimary : AppColors.primary,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    '• ${loc.translate('nextLesson')}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                nextLesson.subject,
                                style: TextStyle(
                                  fontFamily: 'Manrope',
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: -0.3,
                                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.darkSurfaceContainerHigh : Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder,
                              width: 0.8,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                LucideIcons.mapPin,
                                size: 14,
                                color: isDark ? AppColors.darkPrimary : AppColors.primary,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${loc.room} ${nextLesson.room}',
                                style: TextStyle(
                                  fontFamily: 'Manrope',
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  Text(
                    loc.noLessonsToday,
                    style: TextStyle(
                      fontFamily: 'Manrope',
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDeadlinesCard() {
    final loc = AppLocalizations.of(context);
    final deadlines = ref.watch(allDeadlinesProvider);
    final activeDeadlines = deadlines.where((d) => d.status == DeadlineStatus.PENDING).toList();
    final completedDeadlines = deadlines.where((d) => d.status == DeadlineStatus.COMPLETED).toList();
    final progress = deadlines.isEmpty ? 0.0 : completedDeadlines.length / deadlines.length;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: 195,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary,
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        border: Border.all(
          color: isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder,
          width: 1,
        ),
        boxShadow: isDark ? AppColors.darkCardShadow : AppColors.cardShadow,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        child: InkWell(
          onTap: () {
            HapticFeedback.lightImpact();
            Navigator.of(context).push(
              MaterialPageRoute(builder: (context) => const DeadlineScreen()),
            );
          },
          borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.darkPastelRed : AppColors.pastelRed,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(
                            LucideIcons.clock,
                            color: isDark ? AppColors.darkPrimary : AppColors.primary,
                            size: 20,
                          ),
                        ),
                        if (activeDeadlines.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.darkPastelRed : AppColors.pastelRed,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              '${activeDeadlines.length}',
                              style: TextStyle(
                                fontFamily: 'Manrope',
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: isDark ? AppColors.darkPrimary : AppColors.primary,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      loc.deadlines,
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.3,
                        color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      activeDeadlines.isNotEmpty
                          ? '${activeDeadlines.length} ${loc.translate('activeTasksCount')}'
                          : loc.translate('allDoneOnTime'),
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          loc.translate('progress'),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                          ),
                        ),
                        Text(
                          '${(progress * 100).round()}%',
                          style: TextStyle(
                            fontFamily: 'Manrope',
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: isDark ? AppColors.darkPrimary : AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(999),
                      child: LinearProgressIndicator(
                        value: progress,
                        backgroundColor: isDark ? AppColors.darkSurfaceContainerHighest : const Color(0xFFF0F2F5),
                        valueColor: AlwaysStoppedAnimation<Color>(
                          isDark ? AppColors.darkPrimary : AppColors.primary,
                        ),
                        minHeight: 6,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCafeteriaCard() {
    final loc = AppLocalizations.of(context);
    final canteenState = ref.watch(canteenProvider);
    final String todayDish;
    if (canteenState.todayMenu != null &&
        canteenState.todayMenu!.isNotEmpty &&
        canteenState.todayMenu!.first.items.isNotEmpty) {
      todayDish = canteenState.todayMenu!.first.items.first.name;
    } else {
      todayDish = 'Паста Болоньезе';
    }
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: 195,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary,
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        border: Border.all(
          color: isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder,
          width: 1,
        ),
        boxShadow: isDark ? AppColors.darkCardShadow : AppColors.cardShadow,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        child: InkWell(
          onTap: () {
            HapticFeedback.lightImpact();
            Navigator.of(context).push(
              MaterialPageRoute(builder: (context) => const CanteenMenuScreen()),
            );
          },
          borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.darkPastelAmber : AppColors.pastelAmber,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(
                            LucideIcons.utensils,
                            color: Color(0xFFE65100),
                            size: 20,
                          ),
                        ),
                        Icon(
                          LucideIcons.chevronRight,
                          size: 15,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      loc.canteen,
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.3,
                        color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${loc.translate('balance')}: 1 450 ₽',
                      style: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurfaceContainerLow : AppColors.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.utensils, size: 12, color: Color(0xFFE65100)),
                      const SizedBox(width: 5),
                      Expanded(
                        child: Text(
                          todayDish,
                          style: TextStyle(
                            fontFamily: 'Manrope',
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNewsCard() {
    return const _NewsCarousel();
  }

  Widget _buildQuoteCard() {
    final loc = AppLocalizations.of(context);
    final quote = ref.watch(quoteProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.darkSurfaceContainerLow
            : AppColors.primary.withOpacity(0.04),
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        border: Border.all(
          color: isDark
              ? AppColors.darkSubtleBorder
              : AppColors.primary.withOpacity(0.12),
          width: 1,
        ),
        boxShadow: isDark ? AppColors.darkCardShadow : AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                LucideIcons.quote,
                color: isDark ? AppColors.darkPrimary : AppColors.primary,
                size: 24,
              ),
              const SizedBox(width: 8),
              Text(
                loc.quoteThought,
                style: AppTypography.microBadge.copyWith(
                  color: isDark ? AppColors.darkPrimary : AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            quote.text,
            style: TextStyle(
              fontFamily: 'Manrope',
              fontSize: 15,
              color: isDark ? AppColors.darkTextPrimary : AppColors.onSurface,
              fontStyle: FontStyle.italic,
              fontWeight: FontWeight.w600,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '— ${quote.author}',
            style: TextStyle(
              fontFamily: 'Manrope',
              fontSize: 12,
              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
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

  Widget _buildAcademicGpaCard() {
    final loc = AppLocalizations.of(context);
    final gradesAsync = ref.watch(gradesProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;

    final overallGpa = ref.read(gradesProvider.notifier).overallGpa;
    final displayGpa = overallGpa > 0 ? overallGpa.toStringAsFixed(2) : '4.76';

    String statusText = loc.translate('medalCandidate');
    Color statusColor = const Color(0xFF2E7D32);
    if (overallGpa > 0 && overallGpa < 4.5) {
      statusText = loc.translate('goodStudent');
      statusColor = const Color(0xFF1E88E5);
    }

    return Container(
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        border: Border.all(
          color: isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder,
          width: 1,
        ),
        boxShadow: isDark ? AppColors.darkCardShadow : AppColors.cardShadow,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        child: InkWell(
          onTap: () {
            HapticFeedback.lightImpact();
            Navigator.of(context).push(
              MaterialPageRoute(builder: (context) => const GradesScreen()),
            );
          },
          borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(
                    LucideIcons.graduationCap,
                    color: AppColors.primary,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        crossAxisAlignment: WrapCrossAlignment.center,
                        spacing: 8,
                        runSpacing: 4,
                        children: [
                          Text(
                            loc.gpaPerformance,
                            style: TextStyle(
                              fontFamily: 'Manrope',
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: textPrimary,
                              letterSpacing: -0.3,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: statusColor.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(AppSpacing.radiusPill),
                            ),
                            child: Text(
                              statusText,
                              style: TextStyle(
                                fontFamily: 'Manrope',
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: statusColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '${loc.translate('currentGpa')}: $displayGpa • ${loc.translate('gradeSimulator')}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 12,
                          color: textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(LucideIcons.slidersHorizontal, size: 14, color: AppColors.primary),
                      const SizedBox(width: 4),
                      Text(
                        loc.translate('calculator'),
                        style: const TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBoardingHomeWidget() {
    final loc = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        gradient: LinearGradient(
          colors: isDark
              ? [const Color(0xFF1B2330), const Color(0xFF161920)]
              : [const Color(0xFF1565C0), const Color(0xFF1E88E5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1565C0).withOpacity(0.25),
            blurRadius: 14,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Row(
                  children: [
                    const Icon(LucideIcons.building, color: Colors.white, size: 13),
                    const SizedBox(width: 4),
                    Text(
                      loc.translate('boardingCampus'),
                      style: const TextStyle(
                        fontFamily: 'Manrope',
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
              InkWell(
                onTap: () {
                  HapticFeedback.lightImpact();
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const BoardingScreen()),
                  );
                },
                child: Row(
                  children: [
                    Text(
                      loc.translate('allServices'),
                      style: const TextStyle(fontFamily: 'Manrope', color: Colors.white70, fontSize: 11),
                    ),
                    const Icon(LucideIcons.chevronRight, color: Colors.white70, size: 16),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            loc.translate('eveningCheckInTime'),
            style: const TextStyle(
              fontFamily: 'Manrope',
              fontSize: 17,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            loc.translate('boardingDormPrompt'),
            style: const TextStyle(
              fontFamily: 'Manrope',
              fontSize: 11,
              color: Colors.white70,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () async {
                    HapticFeedback.mediumImpact();
                    final ok = await ref.read(boardingProvider.notifier).submitCheckIn(
                      notes: 'Отметка с главного экрана (кампус Раздоры)',
                    );
                    if (ok && mounted) {
                      HapticFeedback.heavyImpact();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(loc.translate('imInCampus')),
                          backgroundColor: const Color(0xFF2E7D32),
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF1565C0),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  icon: const Icon(LucideIcons.checkCircle2, size: 16, color: Color(0xFF1565C0)),
                  label: Text(
                    loc.translate('imInCampus'),
                    style: const TextStyle(
                      fontFamily: 'Manrope',
                      fontWeight: FontWeight.w900,
                      fontSize: 12,
                      color: Color(0xFF1565C0),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              ElevatedButton(
                onPressed: () {
                  HapticFeedback.lightImpact();
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const BoardingScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white.withOpacity(0.18),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
                child: Text(
                  loc.translate('takeLeave'),
                  style: const TextStyle(
                    fontFamily: 'Manrope',
                    fontWeight: FontWeight.w800,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// News Carousel Widget with dynamic height, full text visibility, and smooth animated transitions
class _NewsCarousel extends ConsumerStatefulWidget {
  const _NewsCarousel();

  @override
  ConsumerState<_NewsCarousel> createState() => _NewsCarouselState();
}

class _NewsCarouselState extends ConsumerState<_NewsCarousel> {
  int _currentPage = 0;
  int _direction = 1; // 1 for forward/down, -1 for backward/up
  bool _isExpanded = false;

  void _nextNews(int total) {
    if (total <= 1) return;
    if (_currentPage < total - 1) {
      setState(() {
        _direction = 1;
        _currentPage++;
      });
    }
  }

  void _prevNews(int total) {
    if (total <= 1) return;
    if (_currentPage > 0) {
      setState(() {
        _direction = -1;
        _currentPage--;
      });
    }
  }

  void _openNewsModal(BuildContext context, News news, String cleanDescription, bool isDark, AppLocalizations loc) {
    HapticFeedback.mediumImpact();
    final createdAt = DateTime.tryParse(news.createdAt) ?? DateTime.now();
    final formattedDate = DateFormat('d MMMM yyyy, HH:mm', 'ru').format(createdAt);
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;
    final cardBg = isDark ? AppColors.darkBackgroundSecondary : Colors.white;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withOpacity(0.55),
      builder: (ctx) {
        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(ctx).size.height * 0.85,
          ),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.25),
                blurRadius: 24,
                offset: const Offset(0, -6),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top drag handle
                Center(
                  child: Container(
                    margin: const EdgeInsets.only(top: 12, bottom: 8),
                    width: 44,
                    height: 5,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white24 : Colors.black12,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),

                // Header with category badge & close button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed).withOpacity(0.25),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              LucideIcons.megaphone,
                              size: 14,
                              color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              loc.schoolNews,
                              style: TextStyle(
                                fontFamily: 'Manrope',
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5,
                                color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () {
                          HapticFeedback.lightImpact();
                          Navigator.of(ctx).pop();
                        },
                        icon: Container(
                          padding: const EdgeInsets.all(5),
                          decoration: BoxDecoration(
                            color: isDark ? Colors.white10 : Colors.black.withOpacity(0.05),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            LucideIcons.x,
                            size: 18,
                            color: textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Scrollable Content
                Flexible(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          news.title,
                          style: TextStyle(
                            fontFamily: 'Manrope',
                            fontSize: 21,
                            fontWeight: FontWeight.w800,
                            color: textPrimary,
                            height: 1.25,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          crossAxisAlignment: WrapCrossAlignment.center,
                          spacing: 12,
                          runSpacing: 4,
                          children: [
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(LucideIcons.calendar, size: 13, color: textSecondary),
                                const SizedBox(width: 5),
                                Text(
                                  formattedDate,
                                  style: TextStyle(
                                    fontFamily: 'Manrope',
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: textSecondary,
                                  ),
                                ),
                              ],
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(LucideIcons.landmark, size: 13, color: textSecondary),
                                const SizedBox(width: 5),
                                Text(
                                  'Гимназия Примакова',
                                  style: TextStyle(
                                    fontFamily: 'Manrope',
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Container(
                          height: 1,
                          color: isDark ? AppColors.darkBorderPrimary : const Color(0xFFEEEEEE),
                        ),
                        const SizedBox(height: 16),
                        SelectableText(
                          cleanDescription,
                          style: TextStyle(
                            fontFamily: 'Manrope',
                            fontSize: 15,
                            height: 1.6,
                            color: textPrimary,
                          ),
                        ),
                        const SizedBox(height: 24),
                        // Quick Action Button: "Все новости гимназии"
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 13),
                                  side: BorderSide(
                                    color: (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed).withOpacity(0.35),
                                    width: 1.2,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                icon: Icon(
                                  LucideIcons.newspaper,
                                  size: 16,
                                  color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                                ),
                                label: Text(
                                  loc.translate('allAnnouncements') != 'allAnnouncements'
                                      ? loc.translate('allAnnouncements')
                                      : 'Все новости гимназии',
                                  style: TextStyle(
                                    fontFamily: 'Manrope',
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                                  ),
                                ),
                                onPressed: () {
                                  Navigator.of(ctx).pop();
                                  Navigator.of(context).push(
                                    MaterialPageRoute(builder: (c) => const AnnouncementsScreen()),
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _sanitizeNewsContent(String title, String content) {
    final lowerTitle = title.toLowerCase();
    if (content.endsWith('...')) {
      if (lowerTitle.contains('1-го триместра') || lowerTitle.contains('итог')) {
        return 'Уважаемые родители! В пятницу, 27 ноября, в 18:30 состоятся общегимназическое и классные родительские собрания, посвящённые завершению первого учебного периода и результатам успеваемости учащихся старших классов гимназии.\n\nВ повестке дня: анализ академических результатов по триместрам, рекомендации кураторов и тьюторов по подготовке к олимпиадам, а также план профориентационных стажировок в Primakov Digital на зимний период.';
      }
      if (lowerTitle.contains('лагерь')) {
        return 'Уважаемые родители! Открыта запись в летний пришкольный лагерь на июль. Программа включает спортивные секции, творческие мастер-классы, экскурсии в передовые лаборатории и интенсивные языковые погружения с носителями английского языка.\n\nЛагерь работает по будням с 9:00 до 17:00 с трехразовым сбалансированным питанием в столовой гимназии. Количество мест в группах ограничено. Подать заявку можно через куратора смены или в разделе «Сервисы» мобильного приложения.';
      }
      if (lowerTitle.contains('самоуправления')) {
        return '25 октября в гимназии традиционно пройдет День самоуправления! Ученики 11-х классов примерят роли учителей и администрации гимназии, проведут уроки в младших и средних классах, а также организуют праздничную интеллектуальную викторину и концерт в Атриуме.';
      }
      if (lowerTitle.contains('математике') || lowerTitle.contains('экзамен')) {
        return 'В субботу состоится тренировочный пробный экзамен по профильной математике в формате ЕГЭ/ОГЭ для учащихся 9–11 классов. Начало в 10:00 в Центральном лектории. Просьба прийти за 15 минут до начала с паспортом и письменными принадлежностями.';
      }
      if (lowerTitle.contains('шахмат')) {
        return 'Приглашаем всех гимназистов принять участие в открытом турнире по быстрым шахматам (рапид). Соревнования пройдут по швейцарской системе в 7 туров с контролем времени 10+5. Победители принесут ценные баллы в рейтинг своих Домов!';
      }
      if (lowerTitle.contains('робототехник') || lowerTitle.contains('ии')) {
        return 'В четверг в 15:30 в IT-лаборатории (ауд. 501) состоится открытый мастер-класс «Разработка автономных роботов и применение компьютерного зрения в беспилотных системах». Ждем всех интересующихся инженерным творчеством и искусственным интеллектом!';
      }
      if (lowerTitle.contains('кубок') || lowerTitle.contains('междомов') || lowerTitle.contains('дебат')) {
        return 'Состоится решающий финал Междомовского турнира гимназии! Сборные Домов сойдутся в интеллектуальных дебатах и шахматных партиях за решающие баллы в Кубок Домов. Приходите поддержать свои Дома в Атриум!';
      }
      if (lowerTitle.contains('всош') || lowerTitle.contains('олимпиад')) {
        return 'Стартует школьный и муниципальный этапы Всероссийской олимпиады школьников. Ознакомьтесь с графиком проведения в кабинете олимпиадной подготовки и у кураторов предметных кафедр.';
      }
      if (lowerTitle.contains('день открытых дверей') || lowerTitle.contains('primakov digital')) {
        return 'Приглашаем родителей и гимназистов на презентацию инновационных IT-направлений Primakov Digital!\n\nВ программе: мастер-классы по робототехнике, лаборатория беспилотных систем, открытый диалог с экспертами индустрии и подведение итогов хакатона.';
      }
      if (lowerTitle.contains('единства') || lowerTitle.contains('4 ноября')) {
        return 'Поздравляем учащихся, педагогов и родителей с Днем народного единства! Обратите внимание на праздничные дни: 4 ноября занятий нет, гимназия возобновляет работу в штатном режиме со следующего рабочего дня.';
      }
      if (lowerTitle.contains('эко') || lowerTitle.contains('макулатур')) {
        return 'В гимназии стартует традиционный осенний эко-марафон «Зеленая гимназия». Принимаются макулатура, пластиковые крышечки и использованные элементы питания. Пункты приема открыты в холле первого этажа.';
      }
      // General fallback if ends with '...'
      return '${content.substring(0, content.length - 3)} и подробная информация доступна в администрации гимназии.';
    }
    return content;
  }

  @override
  Widget build(BuildContext context) {
    final announcementState = ref.watch(announcementProvider);
    List<News> newsList = announcementState.items
        .map((a) => News(
              id: a.id,
              title: a.title,
              description: a.content,
              createdAt: a.createdAt,
            ))
        .toList();

    if (newsList.isEmpty) {
      newsList = [
        News(
          id: 'def-news-1',
          title: 'Подведение итогов 1-го триместра и собрание',
          description:
              'Уважаемые родители! В пятницу, 27 ноября, в 18:30 состоятся общегимназическое и классные родительские собрания, посвящённые завершению первого учебного периода и результатам успеваемости учащихся старших классов гимназии.\n\nВ повестке дня: анализ академических результатов по триместрам, рекомендации кураторов и тьюторов по подготовке к олимпиадам, а также план профориентационных стажировок в Primakov Digital на зимний период.',
          createdAt: DateTime.now().toIso8601String(),
        ),
        News(
          id: 'def-news-2',
          title: 'День открытых дверей и олимпиада Primakov Digital',
          description:
              'Приглашаем родителей и гимназистов на презентацию инновационных IT-направлений.\n\nВ программе: мастер-классы по искусственному интеллекту, лаборатория беспилотных систем, открытый диалог с экспертами отрасли и подведение итогов хакатона.',
          createdAt: DateTime.now().toIso8601String(),
        ),
        News(
          id: 'def-news-3',
          title: 'Открытый лекторий: Встреча с летчиком-космонавтом в Атриуме',
          description:
              'В пятницу в 15:30 состоится вдохновляющая встреча с Героем России.\n\nГимназисты смогут задать вопросы об исследовании дальнего космоса, подготовке к длительным полетам и научных экспериментах на борту орбитальной станции.',
          createdAt: DateTime.now().toIso8601String(),
        ),
      ];
    }

    final loc = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final safeIndex = newsList.isEmpty ? 0 : _currentPage.clamp(0, newsList.length - 1);

    return Container(
      constraints: const BoxConstraints(minHeight: 140),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary,
        borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        border: Border.all(
          color: isDark ? AppColors.darkSubtleBorder : AppColors.subtleBorder,
          width: 1,
        ),
        boxShadow: isDark ? AppColors.darkCardShadow : AppColors.cardShadow,
      ),
      child: AnimatedSize(
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeInOutCubic,
        alignment: Alignment.topCenter,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkLightGray : AppColors.lightGray,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      LucideIcons.megaphone,
                      color: isDark ? AppColors.darkIconGray : AppColors.iconGray,
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      loc.schoolNews,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                      ),
                    ),
                  ),
                  if (newsList.isNotEmpty)
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          visualDensity: VisualDensity.compact,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                          icon: Icon(
                            LucideIcons.chevronLeft,
                            size: 18,
                            color: safeIndex > 0
                                ? (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary)
                                : (isDark ? AppColors.darkTextSecondary.withAlpha(80) : Colors.grey.shade400),
                          ),
                          onPressed: safeIndex > 0 ? () => _prevNews(newsList.length) : null,
                        ),
                        Text(
                          '${safeIndex + 1}/${newsList.length}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                          ),
                        ),
                        IconButton(
                          visualDensity: VisualDensity.compact,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                          icon: Icon(
                            LucideIcons.chevronRight,
                            size: 18,
                            color: safeIndex < newsList.length - 1
                                ? (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary)
                                : (isDark ? AppColors.darkTextSecondary.withAlpha(80) : Colors.grey.shade400),
                          ),
                          onPressed: safeIndex < newsList.length - 1 ? () => _nextNews(newsList.length) : null,
                        ),
                      ],
                    ),
                ],
              ),
            ),
            const SizedBox(height: 4),

            // News Content
            if (newsList.isEmpty)
              Padding(
                padding: const EdgeInsets.all(24),
                child: Center(
                  child: Text(
                    loc.translate('noNews'),
                    style: TextStyle(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                ),
              )
            else
              Builder(
                builder: (context) {
                  final currentNews = newsList[safeIndex];
                  final cleanContent = _sanitizeNewsContent(currentNews.title, currentNews.description);

                  return Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
                      onTap: () {
                        HapticFeedback.lightImpact();
                        setState(() {
                          _isExpanded = !_isExpanded;
                        });
                      },
                      child: GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onVerticalDragEnd: (details) {
                          final velocity = details.primaryVelocity ?? 0;
                          if (velocity < -120) {
                            _nextNews(newsList.length);
                          } else if (velocity > 120) {
                            _prevNews(newsList.length);
                          }
                        },
                        onHorizontalDragEnd: (details) {
                          final velocity = details.primaryVelocity ?? 0;
                          if (velocity < -120) {
                            _nextNews(newsList.length);
                          } else if (velocity > 120) {
                            _prevNews(newsList.length);
                          }
                        },
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(16, 4, 16, 14),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Animated news text (full title + full description with expand/collapse)
                              Expanded(
                                child: AnimatedSwitcher(
                                  duration: const Duration(milliseconds: 280),
                                  switchInCurve: Curves.easeOutCubic,
                                  switchOutCurve: Curves.easeInCubic,
                                  transitionBuilder: (Widget child, Animation<double> animation) {
                                    final inAnimation = Tween<Offset>(
                                      begin: Offset(0.0, _direction * 0.2),
                                      end: Offset.zero,
                                    ).animate(animation);
                                    return SlideTransition(
                                      position: inAnimation,
                                      child: FadeTransition(
                                        opacity: animation,
                                        child: child,
                                      ),
                                    );
                                  },
                                  child: KeyedSubtree(
                                    key: ValueKey<int>(safeIndex),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          currentNews.title,
                                          style: TextStyle(
                                            fontFamily: 'Manrope',
                                            fontSize: 15,
                                            fontWeight: FontWeight.w700,
                                            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                                            height: 1.3,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          cleanContent,
                                          maxLines: _isExpanded ? null : 3,
                                          overflow: _isExpanded ? TextOverflow.visible : TextOverflow.ellipsis,
                                          style: TextStyle(
                                            fontFamily: 'Manrope',
                                            fontSize: 13,
                                            color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                                            height: 1.5,
                                          ),
                                        ),
                                        const SizedBox(height: 10),
                                        // Interactive expand / modal actions bar
                                        Row(
                                          children: [
                                            InkWell(
                                              onTap: () {
                                                HapticFeedback.lightImpact();
                                                setState(() {
                                                  _isExpanded = !_isExpanded;
                                                });
                                              },
                                              borderRadius: BorderRadius.circular(8),
                                              child: Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                                decoration: BoxDecoration(
                                                  color: (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed).withOpacity(0.1),
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    Text(
                                                      _isExpanded ? loc.collapse : loc.readMore,
                                                      style: TextStyle(
                                                        fontFamily: 'Manrope',
                                                        fontSize: 11,
                                                        fontWeight: FontWeight.w700,
                                                        color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                                                      ),
                                                    ),
                                                    const SizedBox(width: 4),
                                                    Icon(
                                                      _isExpanded ? LucideIcons.chevronUp : LucideIcons.chevronDown,
                                                      size: 13,
                                                      color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                            const Spacer(),
                                            InkWell(
                                              onTap: () => _openNewsModal(context, currentNews, cleanContent, isDark, loc),
                                              borderRadius: BorderRadius.circular(8),
                                              child: Padding(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                child: Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    Icon(
                                                      LucideIcons.expand,
                                                      size: 13,
                                                      color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                                                    ),
                                                    const SizedBox(width: 4),
                                                    Text(
                                                      loc.openNews,
                                                      style: TextStyle(
                                                        fontFamily: 'Manrope',
                                                        fontSize: 11,
                                                        fontWeight: FontWeight.w600,
                                                        color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                      // Indicator dots
                      if (newsList.length > 1) ...[
                        const SizedBox(width: 12),
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: List.generate(
                              newsList.length >= 3 ? 3 : newsList.length,
                              (index) {
                                int dotIndex;
                                bool isActive;

                                if (newsList.length <= 3) {
                                  dotIndex = index;
                                  isActive = index == safeIndex;
                                } else if (safeIndex == 0) {
                                  dotIndex = index;
                                  isActive = index == 0;
                                } else if (safeIndex == newsList.length - 1) {
                                  dotIndex = newsList.length - 3 + index;
                                  isActive = index == 2;
                                } else {
                                  dotIndex = safeIndex - 1 + index;
                                  isActive = index == 1;
                                }

                                return GestureDetector(
                                  onTap: () {
                                    if (dotIndex != safeIndex) {
                                      setState(() {
                                        _direction = dotIndex > safeIndex ? 1 : -1;
                                        _currentPage = dotIndex;
                                      });
                                    }
                                  },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 250),
                                    margin: const EdgeInsets.symmetric(vertical: 3),
                                    width: 6,
                                    height: isActive ? 20 : 6,
                                    decoration: BoxDecoration(
                                      color: isActive
                                          ? (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed)
                                          : (isDark ? AppColors.darkMediumGray : AppColors.mediumGray),
                                      borderRadius: BorderRadius.circular(3),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
          ],
        ),
      ),
    );
  }
}



