/// Schedule Screen
/// Converted from React Native ScheduleScreen.tsx
import 'dart:async';
import '../../config/app_colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../models/api_models.dart';
import '../../providers/schedule_provider.dart';
import '../../providers/auth_provider.dart';

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
    final userId = ref.read(authProvider).userId;
    if (userId == null) {
      print('❌ User not authenticated');
      return;
    }

    final dateString = date.toIso8601String().split('T')[0];
    print('📅 Loading schedule for userId: $userId, date: $dateString');

    await ref.read(scheduleProvider.notifier).fetchSchedule(
      userId,
      dateString,
    );
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2024),
      lastDate: DateTime(2025),
      locale: const Locale('ru', 'RU'),
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

    return Scaffold(
      backgroundColor: AppColors.backgroundPrimary,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(64),
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.backgroundPrimary.withOpacity(0.8),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0xFFE8E8EA),
                            width: 2,
                          ),
                        ),
                        child: ClipOval(
                          child: Image.network(
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuDqNQXspw8VWOz5AeaaX53YchVxqKlN0n-e5mYJjvLV0uNHNiFQTl0SgKrpGnFakAbaEOqFp4KYbIVYMIxP5F7vru4_Y1K5jks8eLo8VtVFfM4GdK0EUsxk8CXqLdYfmRCnOTVn3w7mtul9cpLqfqSO4TSk8RVKsEIVbBfKA0O4NpZw5TjlO7y_Zo36dXwgfbOodNQd0szBID1EnMTi_9ZbBaw77BTGy-1rJke6eAsUZbw6D9v-AnRqT6zAX2ppU7UsQVotSjxY0qz7',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                color: AppColors.primaryRedLight,
                                child:  const Icon(Icons.person, color: AppColors.backgroundSecondary, size: 24),
                              );
                            },
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'Расписание',
                        style: TextStyle(
                          fontFamily: 'Manrope',
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF8C251C),
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.event, color: Color(0xFF57423E)),
                    onPressed: _pickDate,
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await _loadData();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),

                // Date Selector
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      DateFormat('MMMM yyyy', 'ru').format(_selectedDate),
                      style: const TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1C1D),
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedDate = DateTime.now();
                        });
                        _loadScheduleForDate(DateTime.now());
                      },
                      child: const Text(
                        'Сегодня',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF8C251C),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Week Days Selector
                SizedBox(
                  height: 70,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: _weekDates.length,
                    itemBuilder: (context, index) {
                      final date = _weekDates[index];
                      final isSelected = date.day == _selectedDate.day &&
                          date.month == _selectedDate.month &&
                          date.year == _selectedDate.year;
                      final dayName = DateFormat('EEE', 'ru').format(date).toUpperCase();

                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedDate = date;
                          });
                          _loadScheduleForDate(date);
                        },
                        child: Container(
                          width: 56,
                          margin: const EdgeInsets.only(right: 12),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFF8C251C)
                                : const Color(0xFFF3F3F5),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: const Color(0xFF8C251C).withOpacity(0.2),
                                      blurRadius: 15,
                                      offset: const Offset(0, 5),
                                    ),
                                  ]
                                : null,
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                dayName.substring(0, 2),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.5,
                                  color: isSelected
                                      ? Colors.white
                                      : const Color(0xFF5F5E5E),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${date.day}',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected
                                      ? Colors.white
                                      : const Color(0xFF1A1C1D),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 24),

                // Lessons Section
                if (scheduleError != null)
                  Center(
                    child: Column(
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: Colors.red),
                        const SizedBox(height: 8),
                        Text('Ошибка: $scheduleError'),
                        const SizedBox(height: 8),
                        ElevatedButton(
                          onPressed: () => _loadScheduleForDate(_selectedDate),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF8C251C),
                          ),
                          child: const Text('Повторить'),
                        ),
                      ],
                    ),
                  )
                else if (scheduleLoading)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32.0),
                      child: CircularProgressIndicator(
                        color: Color(0xFF8C251C),
                      ),
                    ),
                  )
                else if (schedule != null && schedule.lessons.isNotEmpty)
                  Column(
                    children: _buildLessonsWithBreaks(schedule.lessons),
                  )
                else
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Column(
                        children: [
                          Icon(
                            Icons.school,
                            size: 48,
                            color: Colors.grey.withOpacity(0.3),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Нет уроков на этот день',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey.withOpacity(0.5),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 100),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _buildLessonsWithBreaks(List<Lesson> lessons) {
    final widgets = <Widget>[];

    for (int i = 0; i < lessons.length; i++) {
      final lesson = lessons[i];

      // Add lesson card
      widgets.add(_CompactLessonCard(lesson: lesson));
      widgets.add(const SizedBox(height: 8));

      // Add big break after 2nd lesson (index 1)
      if (i == 1 && lessons.length > 2) {
        widgets.add(_BigBreakCard());
        widgets.add(const SizedBox(height: 8));
      }
    }

    return widgets;
  }
}

// Compact Lesson Card Widget
class _CompactLessonCard extends StatelessWidget {
  final Lesson lesson;

  const _CompactLessonCard({required this.lesson});

  @override
  Widget build(BuildContext context) {
    final startTime = lesson.startTime.isNotEmpty ? lesson.startTime : '--:--';
    final endTime = lesson.endTime.isNotEmpty ? lesson.endTime : '--:--';
    final subject = lesson.subject.isNotEmpty ? lesson.subject : 'Без названия';
    final teacherId = lesson.teacherId.isNotEmpty ? lesson.teacherId : 'Не указан';
    final room = lesson.room.isNotEmpty ? lesson.room : '?';

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Time column
        SizedBox(
          width: 56,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                startTime,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A1C1D),
                ),
              ),
              Text(
                endTime,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF5F5E5E),
                  letterSpacing: -0.5,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 16),

        // Lesson card
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.backgroundSecondary,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                // Vertical accent line
                Container(
                  width: 4,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFF8C251C).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 12),

                // Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        subject,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1A1C1D),
                          height: 1.2,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Кабинет $room • $teacherId',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF5F5E5E),
                          height: 1.2,
                        ),
                      ),
                    ],
                  ),
                ),

                // Chevron icon
                const Icon(
                  Icons.chevron_right,
                  size: 18,
                  color: Color(0xFF5F5E5E),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// Big Break Card Widget
class _BigBreakCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 72),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF8C251C).withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: const Border(
            left: BorderSide(
              color: Color(0xFF8C251C),
              width: 2,
            ),
          ),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(
                  Icons.restaurant,
                  size: 18,
                  color: Color(0xFF8C251C),
                ),
                SizedBox(width: 8),
                Text(
                  'БОЛЬШАЯ ПЕРЕМЕНА',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF8C251C),
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
            Text(
              '25 минут',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: Color(0xFF8C251C),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class StoryViewerScreen extends StatefulWidget {
  final List<Story> stories;
  final int initialIndex;
  final Function(String) onStoryViewed;

  const StoryViewerScreen({
    Key? key,
    required this.stories,
    required this.initialIndex,
    required this.onStoryViewed,
  }) : super(key: key);

  @override
  State<StoryViewerScreen> createState() => _StoryViewerScreenState();
}

class _StoryViewerScreenState extends State<StoryViewerScreen> {
  late PageController _pageController;
  late int _currentIndex;
  bool _isPaused = false;

  // Прогресс для каждой истории
  late List<double> _progressValues;
  late List<Timer?> _storyTimers;
  late List<bool> _isCompleted;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: _currentIndex);
    
    _progressValues = List.filled(widget.stories.length, 0.0);
    _storyTimers = List.filled(widget.stories.length, null);
    _isCompleted = List.filled(widget.stories.length, false);
    
    // Запускаем таймер для текущей истории
    _startTimerForCurrentStory();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _stopAllTimers();
    super.dispose();
  }

  void _stopAllTimers() {
    for (var timer in _storyTimers) {
      timer?.cancel();
    }
  }

  void _startTimerForCurrentStory() {
    // Останавливаем текущий таймер если есть
    _storyTimers[_currentIndex]?.cancel();
    
    if (_isCompleted[_currentIndex]) return;
    
    const duration = Duration(seconds: 10);
    const interval = Duration(milliseconds: 50);
    
    _storyTimers[_currentIndex] = Timer.periodic(interval, (timer) {
      if (!_isPaused && mounted) {
        setState(() {
          if (_progressValues[_currentIndex] < 1.0) {
            _progressValues[_currentIndex] += 50 / duration.inMilliseconds;
            if (_progressValues[_currentIndex] >= 1.0) {
              _progressValues[_currentIndex] = 1.0;
              _isCompleted[_currentIndex] = true;
              timer.cancel();
              _goToNextStory();
            }
          }
        });
      }
    });
  }

  void _goToNextStory() {
    if (_currentIndex < widget.stories.length - 1) {
      // Отмечаем текущую как просмотренную
      widget.onStoryViewed(widget.stories[_currentIndex].id);
      
      // Переходим к следующей
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      // Последняя история - закрываем
      widget.onStoryViewed(widget.stories[_currentIndex].id);
      Navigator.pop(context);
    }
  }

  void _goToPreviousStory() {
    if (_currentIndex > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _onPageChanged(int index) {
    // Отмечаем предыдущую историю как просмотренную
    if (_currentIndex != index && !_isCompleted[_currentIndex]) {
      widget.onStoryViewed(widget.stories[_currentIndex].id);
      _isCompleted[_currentIndex] = true;
    }
    
    setState(() {
      _currentIndex = index;
      _isPaused = false;
    });
    
    // Запускаем таймер для новой истории
    _startTimerForCurrentStory();
  }

  void _togglePause() {
    setState(() {
      _isPaused = !_isPaused;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTap: _togglePause,
        onLongPress: () {
          setState(() {
            _isPaused = true;
          });
        },
        onLongPressUp: () {
          setState(() {
            _isPaused = false;
          });
        },
        child: Stack(
          children: [
            // PageView для листания историй
            PageView.builder(
              controller: _pageController,
              onPageChanged: _onPageChanged,
              itemCount: widget.stories.length,
              itemBuilder: (context, index) {
                final story = widget.stories[index];
                return Stack(
                  children: [
                    // Контент истории
                    Center(
                      child: story.imageUrl != null && story.imageUrl!.isNotEmpty
                          ? InteractiveViewer(
                              minScale: 0.8,
                              maxScale: 3.0,
                              child: Image.network(
                                story.imageUrl!,
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    color: Colors.grey[900],
                                    child: Center(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          const Icon(
                                            Icons.broken_image,
                                            size: 64,
                                            color: Colors.grey,
                                          ),
                                          const SizedBox(height: 16),
                                          Text(
                                            story.title,
                                            style: const TextStyle(
                                              color: AppColors.backgroundSecondary,
                                              fontSize: 20,
                                              fontWeight: FontWeight.bold,
                                            ),
                                            textAlign: TextAlign.center,
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            story.description,
                                            style: TextStyle(
                                              color: AppColors.textPrimary.withOpacity(0.7),
                                              fontSize: 16,
                                            ),
                                            textAlign: TextAlign.center,
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            )
                          : Container(
                              color: Colors.grey[900],
                              child: Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(
                                      Icons.photo,
                                      size: 64,
                                      color: Colors.grey,
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      story.title,
                                      style: const TextStyle(
                                        color: AppColors.backgroundSecondary,
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      story.description,
                                      style:  TextStyle(
                                        color: AppColors.textPrimary.withOpacity(0.7),
                                        fontSize: 16,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                    ),
                    
                    // Затемнение при паузе
                    if (_isPaused)
                      Container(
                        color: Colors.black.withOpacity(0.5),
                        child:  const Center(
                          child: Icon(
                            Icons.pause_circle_filled,
                            size: 80,
                            color: AppColors.backgroundSecondary,
                          ),
                        ),
                      ),
                  ],
                );
              },
            ),
            
            // Прогресс бары сверху
            Positioned(
              top: 40,
              left: 16,
              right: 16,
              child: Row(
                children: List.generate(
                  widget.stories.length,
                  (index) => Expanded(
                    child: Container(
                      height: 3,
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      decoration: BoxDecoration(
                        color: AppColors.backgroundSecondary.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: Stack(
                        children: [
                          if (_progressValues[index] > 0)
                            Container(
                              width: MediaQuery.of(context).size.width * 
                                  (1 / widget.stories.length) * _progressValues[index],
                              height: 3,
                              decoration: BoxDecoration(
                                color: AppColors.backgroundSecondary,
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            
            // Кнопки навигации (левый/правый тап)
            Positioned.fill(
              child: Row(
                children: [
                  // Левая область для переключения назад
                  Expanded(
                    child: GestureDetector(
                      onTap: _goToPreviousStory,
                      behavior: HitTestBehavior.translucent,
                    ),
                  ),
                  // Правая область для переключения вперед
                  Expanded(
                    child: GestureDetector(
                      onTap: _goToNextStory,
                      behavior: HitTestBehavior.translucent,
                    ),
                  ),
                ],
              ),
            ),
            
            // Кнопка закрытия
            Positioned(
              top: 40,
              right: 16,
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.close,
                    color: AppColors.backgroundSecondary,
                    size: 24,
                  ),
                ),
              ),
            ),
            
            // Текст истории
            Positioned(
              bottom: 50,
              left: 20,
              right: 20,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.stories[_currentIndex].title,
                    style: const TextStyle(
                      color: AppColors.backgroundSecondary,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.stories[_currentIndex].description,
                    style: TextStyle(
                      color: AppColors.textPrimary.withOpacity(0.7),
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Диалог для полноэкранного режима
class FullScreenDialogRoute<T> extends PageRoute<T> {
  final WidgetBuilder builder;

  FullScreenDialogRoute({required this.builder});

  @override
  Color get barrierColor => Colors.black;

  @override
  String get barrierLabel => 'Full Screen Dialog';

  @override
  Widget buildPage(BuildContext context, Animation<double> animation, Animation<double> secondaryAnimation) {
    return builder(context);
  }

  @override
  bool get maintainState => true;

  @override
  Duration get transitionDuration => const Duration(milliseconds: 300);

  @override
  bool get opaque => false;

  @override
  bool get barrierDismissible => true;
}


