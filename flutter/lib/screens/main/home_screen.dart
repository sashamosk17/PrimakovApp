/// Home Screen - Main Dashboard
/// Redesigned with Bento Grid layout, Stories section, and modern UI

import 'package:flutter/material.dart';
import '../../config/app_colors.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../providers/story_provider.dart';
import '../../providers/deadline_provider.dart';
import '../../providers/schedule_provider.dart';
import '../../models/api_models.dart';
import '../../config/app_spacing.dart';
import '../../config/app_typography.dart';
import 'schedule_screen.dart';
import 'deadline_screen.dart';
import 'story_viewer_screen.dart';
import '../canteen_menu_screen.dart';

// Mock data providers
final mockNewsListProvider = Provider<List<News>>((ref) {
  return [
    News(
      id: '1',
      title: 'Открытие новой лаборатории робототехники в следующую субботу',
      description: 'Приглашаем родителей на торжественную презентацию новых проектов учащихся ФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФФ',
      imageUrl: null,
      createdAt: DateTime.now().toIso8601String(),
    ),
    News(
      id: '2',
      title: 'Весенний концерт состоится 25 апреля',
      description: 'Ученики представят музыкальные номера и театральные постановки. Начало в 18:00 в актовом зале.',
      imageUrl: null,
      createdAt: DateTime.now().toIso8601String(),
    ),
    News(
      id: '3',
      title: 'Экскурсия в музей космонавтики',
      description: 'Для учеников 8-10 классов организована экскурсия. Запись у классных руководителей до 20 апреля.',
      imageUrl: null,
      createdAt: DateTime.now().toIso8601String(),
    ),
    News(
      id: '4',
      title: 'Спортивные соревнования между классами',
      description: 'Приглашаем всех на межклассные соревнования по баскетболу и волейболу. Начало 22 апреля в 15:00.',
      imageUrl: null,
      createdAt: DateTime.now().toIso8601String(),
    ),
    News(
      id: '5',
      title: 'День открытых дверей для будущих первоклассников',
      description: 'Родители будущих учеников могут познакомиться с гимназией и педагогами. Регистрация на сайте.',
      imageUrl: null,
      createdAt: DateTime.now().toIso8601String(),
    ),
    News(
      id: '6',
      title: 'Научная конференция "Молодые исследователи"',
      description: 'Ученики 9-11 классов представят свои научные проекты. Лучшие работы будут отправлены на городской конкурс.',
      imageUrl: null,
      createdAt: DateTime.now().toIso8601String(),
    ),
  ];
});

final mockQuoteProvider = Provider<Quote>((ref) {
  return Quote(
    id: '1',
    text: 'Образование — это самое мощное оружие, которое вы можете использовать, чтобы изменить мир.',
    author: 'Нельсон Мандела',
  );
});

final mockCafeteriaProvider = Provider<CafeteriaInfo>((ref) {
  return CafeteriaInfo(
    balance: 1450.0,
    todayMenu: 'Паста Болоньезе',
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
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = ref.watch(currentUserProvider);
    final userName = currentUser != null
        ? '${currentUser.lastName} ${currentUser.firstName}'
        : '';
    final userRole = currentUser != null ? _roleLabel(currentUser.role) : '';

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
              child: _buildTopAppBar(userName, userRole, currentUser),
            ),

            // Stories Section
            SliverToBoxAdapter(
              child: _buildStoriesSection(),
            ),

            // Bento Grid Content
            SliverPadding(
              padding: AppSpacing.paddingMD,
              sliver: SliverToBoxAdapter(
                child: Column(
                  children: [
                    // Row 1: Schedule (full width)
                    _buildScheduleCard(),
                    const SizedBox(height: AppSpacing.md),

                    // Row 2: Deadlines + Cafeteria
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: _buildDeadlinesCard(),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildCafeteriaCard(),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // Row 3: News (full width)
                    _buildNewsCard(),
                    const SizedBox(height: AppSpacing.md),

                    // Quote Card
                    _buildQuoteCard(),
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

  String _roleLabel(UserRole role) {
    switch (role) {
      case UserRole.STUDENT:
        return 'Ученик';
      case UserRole.TEACHER:
        return 'Учитель';
      case UserRole.ADMIN:
        return 'Администратор';
    }
  }

  String _initials(String? firstName, String? lastName) {
    final f = (firstName?.isNotEmpty == true) ? firstName![0].toUpperCase() : '';
    final l = (lastName?.isNotEmpty == true) ? lastName![0].toUpperCase() : '';
    return '$l$f';
  }

  Widget _buildTopAppBar(String userName, String userRole, User? currentUser) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final initials = _initials(currentUser?.firstName, currentUser?.lastName);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg - 4, vertical: AppSpacing.md),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Center(
              child: Text(
                initials,
                style: AppTypography.heading2.copyWith(
                  color: isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary,
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
                  userName,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  ),
                ),
                Text(
                  userRole,
                  style: TextStyle(color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                ),
              ],
            ),
          ),
          Container( //пока так
                          child: Center(
                            child: Opacity(
                              opacity: 0.8,
                              child: Image.asset(
                                'assets/images/primakov_logo.png',
                                width: 24,
                                height: 24,
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          )
          // Search Button
          // IconButton(
          //   icon: const Icon(Icons.search, size: 28),
          //   color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
          //   onPressed: () {
          //     // TODO: Implement search
          //   },
          // ),
        ],
      ),
    );
  }

  Widget _buildStoriesSection() {
    final stories = ref.watch(allStoriesProvider);
    final userId = ref.watch(authProvider).userId ?? '';

    // Mock stories if empty
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
      height: 110,
      margin: const EdgeInsets.only(top: 8, bottom: 16),
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
        width: 72,
        margin: const EdgeInsets.only(right: 12),
        child: Column(
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isViewed 
                      ? (isDark ? AppColors.darkBorderPrimary : Colors.grey.shade300)
                      : (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed),
                  width: 3,
                ),
              ),
              child: ClipOval(
                child: Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isViewed 
                        ? (isDark ? AppColors.darkSurfaceVariant : Colors.grey.shade200) 
                        : (isDark ? AppColors.darkStoryBackground : AppColors.storyBackground),
                  ),
                  child: story.imageUrl != null && story.imageUrl!.isNotEmpty
                      ? Image.asset(
                          story.imageUrl!,
                          width: 58,
                          height: 58,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Icon(
                              _getStoryIcon(story.title),
                              color: isViewed 
                                  ? (isDark ? AppColors.darkIconGray : Colors.grey.shade400) 
                                  : (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed),
                              size: 28,
                            );
                          },
                        )
                      : Icon(
                          _getStoryIcon(story.title),
                          color: isViewed 
                              ? (isDark ? AppColors.darkIconGray : Colors.grey.shade400) 
                              : (isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed),
                          size: 28,
                        ),
                ),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              story.title,
              style: TextStyle(
                fontSize: 11,
                color: isViewed 
                    ? (isDark ? AppColors.darkTextSecondary : Colors.grey.shade500) 
                    : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
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
        return Icons.event;
      case 'приказы':
        return Icons.description;
      case 'меню':
        return Icons.restaurant_menu;
      case 'оценки':
        return Icons.grade;
      case 'разное':
        return Icons.more_horiz;
      default:
        return Icons.circle;
    }
  }

  Widget _buildScheduleCard() {
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
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary,
        borderRadius: BorderRadius.circular(16),
        border: isDark ? Border.all(color: AppColors.darkBorderPrimary) : null,
        boxShadow: isDark ? null : [
          BoxShadow(
            color: Colors.black.withAlpha((0.05 * 255).round()),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkStoryBackground : AppColors.storyBackground,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.calendar_today,
                  color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Мое расписание',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  ),
                ),
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
                  'Смотреть всё',
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
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
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkLightGray : AppColors.lightGray,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Следующий урок: ${nextLesson.subject} • ${nextLesson.startTime}',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Кабинет: ${nextLesson.room}',
                    style: TextStyle(color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                  ),
                ],
              ),
            )
          else
            Text(
              'Сегодня нет уроков',
              style: TextStyle(
                fontSize: 14,
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildDeadlinesCard() {
    final deadlines = ref.watch(allDeadlinesProvider);
    final activeDeadlines = deadlines.where((d) => d.status == DeadlineStatus.PENDING).toList();
    final completedDeadlines = deadlines.where((d) => d.status == DeadlineStatus.COMPLETED).toList();
    final progress = deadlines.isEmpty ? 0.0 : completedDeadlines.length / deadlines.length;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => const DeadlineScreen(),
          ),
        );
      },
      child: Container(
        height: 180,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary,
          borderRadius: BorderRadius.circular(16),
          border: isDark ? Border.all(color: AppColors.darkBorderPrimary) : null,
          boxShadow: isDark ? null : [
            BoxShadow(
              color: Colors.black.withAlpha((0.05 * 255).round()),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkStoryBackground : AppColors.storyBackground,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.alarm,
                    color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                    size: 20,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Дедлайны',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${activeDeadlines.length} активных задачи до пятницы',
                  style: TextStyle(color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                ),
              ],
            ),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: isDark ? AppColors.darkMediumGray : Colors.grey.shade200,
                valueColor: AlwaysStoppedAnimation<Color>(isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed),
                minHeight: 8,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCafeteriaCard() {
    final cafeteria = ref.watch(mockCafeteriaProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => const CanteenMenuScreen(),
          ),
        );
      },
      child: Container(
        height: 180,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary,
          borderRadius: BorderRadius.circular(16),
          border: isDark ? Border.all(color: AppColors.darkBorderPrimary) : null,
          boxShadow: isDark ? null : [
            BoxShadow(
              color: Colors.black.withAlpha((0.05 * 255).round()),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkLightGray : AppColors.lightGray,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.restaurant,
                    color: isDark ? AppColors.darkIconGray : AppColors.iconGray,
                    size: 20,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Столовая',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Баланс: ${cafeteria.balance.toStringAsFixed(0)} ₽',
                  style: TextStyle(color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                ),
              ],
            ),
            Text(
              'Обед: ${cafeteria.todayMenu}',
              style: TextStyle(
                fontSize: 12,
                color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNewsCard() {
    return const _NewsCarousel();
  }

  Widget _buildQuoteCard() {
    final quote = ref.watch(mockQuoteProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkPrimaryRed.withAlpha((0.05 * 255).round()) : AppColors.primaryRed.withAlpha((0.05 * 255).round()),
        borderRadius: BorderRadius.circular(16),
        border: Border(
          left: BorderSide(
            color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
            width: 4,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.format_quote,
            color: isDark ? AppColors.darkPrimaryRed.withAlpha((0.5 * 255).round()) : AppColors.primaryRed.withAlpha((0.5 * 255).round()),
            size: 32,
          ),
          const SizedBox(height: 8),
          Text(
            quote.text,
            style: TextStyle(
              fontSize: 16,
              color: isDark ? AppColors.darkPrimaryRed : AppColors.primaryRed,
              fontStyle: FontStyle.italic,
              fontWeight: FontWeight.bold,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '— ${quote.author}'.toUpperCase(),
            style: TextStyle(
              fontSize: 11,
              color: isDark ? AppColors.darkPrimaryRed.withAlpha((0.7 * 255).round()) : AppColors.primaryRed.withAlpha((0.7 * 255).round()),
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
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

/// News Carousel Widget with dynamic height, full text visibility, and smooth animated transitions
class _NewsCarousel extends ConsumerStatefulWidget {
  const _NewsCarousel();

  @override
  ConsumerState<_NewsCarousel> createState() => _NewsCarouselState();
}

class _NewsCarouselState extends ConsumerState<_NewsCarousel> {
  int _currentPage = 0;
  int _direction = 1; // 1 for forward/down, -1 for backward/up

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

  @override
  Widget build(BuildContext context) {
    final newsList = ref.watch(mockNewsListProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final safeIndex = newsList.isEmpty ? 0 : _currentPage.clamp(0, newsList.length - 1);

    return Container(
      constraints: const BoxConstraints(minHeight: 140),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkBackgroundSecondary : AppColors.backgroundSecondary,
        borderRadius: BorderRadius.circular(16),
        border: isDark ? Border.all(color: AppColors.darkBorderPrimary) : null,
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withAlpha((0.05 * 255).round()),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: AnimatedSize(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
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
                      Icons.campaign,
                      color: isDark ? AppColors.darkIconGray : AppColors.iconGray,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Новости гимназии',
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
                            Icons.chevron_left,
                            size: 20,
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
                            Icons.chevron_right,
                            size: 20,
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
                    'Нет новостей',
                    style: TextStyle(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                ),
              )
            else
              GestureDetector(
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
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Animated news text (full title + full description)
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
                                  newsList[safeIndex].title,
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                                    height: 1.3,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  newsList[safeIndex].description,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                                    height: 1.45,
                                  ),
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
          ],
        ),
      ),
    );
  }
}



