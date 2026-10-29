/// Story Viewer Screen - Instagram-style story viewer
import '../../config/app_colors.dart';
/// Swipe left/right to navigate between stories, tap to pause/resume

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/api_models.dart';
import '../../providers/story_provider.dart';
import 'dart:async';
import 'package:url_launcher/url_launcher.dart';

class StoryViewerScreen extends ConsumerStatefulWidget {
  final List<Story> stories;
  final int initialIndex;

  const StoryViewerScreen({
    Key? key,
    required this.stories,
    this.initialIndex = 0,
  }) : super(key: key);

  @override
  ConsumerState<StoryViewerScreen> createState() => _StoryViewerScreenState();
}

class _StoryViewerScreenState extends ConsumerState<StoryViewerScreen> {
  late PageController _pageController;
  late int _currentIndex;
  Timer? _progressTimer;
  double _progress = 0.0;
  bool _isPaused = false;
  static const _storyDuration = 5; // seconds

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: _currentIndex);
    _startProgress();
    _markCurrentAsViewed();
  }

  @override
  void dispose() {
    _progressTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startProgress() {
    _progress = 0.0;
    _progressTimer?.cancel();

    _progressTimer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      if (!_isPaused) {
        setState(() {
          _progress += 0.05 / _storyDuration;
        });

        if (_progress >= 1.0) {
          timer.cancel();
          // Отложенный вызов навигации после завершения текущего фрейма
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              _nextStory();
            }
          });
        }
      }
    });
  }

  void _nextStory() {
    if (!mounted) return;

    if (_currentIndex < widget.stories.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _progressTimer?.cancel();
      Navigator.of(context).pop();
    }
  }

  void _previousStory() {
    if (_currentIndex > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentIndex = index;
    });
    _startProgress();
    _markCurrentAsViewed();
  }

  void _markCurrentAsViewed() {
    final story = widget.stories[_currentIndex];
    ref.read(storyProvider.notifier).markAsViewed(story.id);
  }

  void _togglePause() {
    setState(() {
      _isPaused = !_isPaused;
    });
  }

  @override
  Widget build(BuildContext context) {
    final story = widget.stories[_currentIndex];

    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTapDown: (details) {
          final screenWidth = MediaQuery.of(context).size.width;
          if (details.globalPosition.dx < screenWidth / 3) {
            _previousStory();
          } else if (details.globalPosition.dx > screenWidth * 2 / 3) {
            _nextStory();
          } else {
            _togglePause();
          }
        },
        child: Stack(
          children: [
            // Story Content
            PageView.builder(
              controller: _pageController,
              onPageChanged: _onPageChanged,
              itemCount: widget.stories.length,
              itemBuilder: (context, index) {
                return _buildStoryContent(widget.stories[index]);
              },
            ),

            // Progress Bars
            SafeArea(
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    child: Row(
                      children: List.generate(
                        widget.stories.length,
                        (index) => Expanded(
                          child: Container(
                            height: 3,
                            margin: const EdgeInsets.symmetric(horizontal: 2),
                            decoration: BoxDecoration(
                              color: AppColors.backgroundSecondary.withAlpha((0.3 * 255).round()),
                              borderRadius: BorderRadius.circular(2),
                            ),
                            child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor: index == _currentIndex
                                  ? _progress
                                  : (index < _currentIndex ? 1.0 : 0.0),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: AppColors.backgroundSecondary,
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Header
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.primaryRed,
                          ),
                          child: const Icon(
                            Icons.school,
                            color: AppColors.backgroundSecondary,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                story.title,
                                style: const TextStyle(
                                  color: AppColors.backgroundSecondary,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                'Гимназия Примакова',
                                style: TextStyle(
                                  color: AppColors.textPrimary.withAlpha((0.7 * 255).round()),
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: AppColors.backgroundSecondary),
                          onPressed: () => Navigator.of(context).pop(),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Pause indicator
            if (_isPaused)
              Center(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.pause,
                    color: AppColors.backgroundSecondary,
                    size: 48,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStoryContent(Story story) {
    return Container(
      color: Colors.black,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(flex: 1),
              // Image or Icon
              if (story.imageUrl != null)
                Container(
                  width: 280,
                  height: 280,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha((0.3 * 255).round()),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.asset(
                      story.imageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.primaryRed,
                          ),
                          child: Icon(
                            _getStoryIcon(story.title),
                            color: AppColors.backgroundSecondary,
                            size: 60,
                          ),
                        );
                      },
                    ),
                  ),
                )
              else
                Container(
                  width: 120,
                  height: 120,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.primaryRed,
                  ),
                  child: Icon(
                    _getStoryIcon(story.title),
                    color: AppColors.backgroundSecondary,
                    size: 60,
                  ),
                ),
              const SizedBox(height: 32),

              // Title
              Text(
                story.title,
                style: const TextStyle(
                  color: AppColors.backgroundSecondary,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),

              // Description
              Text(
                story.description,
                style: TextStyle(
                  color: AppColors.textPrimary.withAlpha((0.7 * 255).round()),
                  fontSize: 16,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),

              // Link button
              if (story.linkUrl != null && story.linkText != null) ...[
                const SizedBox(height: 24),
                GestureDetector(
                  onTap: () => _launchURL(story.linkUrl!),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.primaryRed,
                      borderRadius: BorderRadius.circular(25),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryRed.withAlpha((0.3 * 255).round()),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Подробнее',
                          style: const TextStyle(
                            color: AppColors.backgroundSecondary,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(
                          Icons.arrow_forward,
                          color: AppColors.backgroundSecondary,
                          size: 16,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _launchURL(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Не удалось открыть ссылку'),
            backgroundColor: AppColors.primaryRed,
          ),
        );
      }
    }
  }

  IconData _getStoryIcon(String title) {
    final lowerTitle = title.toLowerCase();
    if (lowerTitle.contains('событ') || lowerTitle.contains('новост')) {
      return Icons.event;
    } else if (lowerTitle.contains('приказ') || lowerTitle.contains('объявл')) {
      return Icons.campaign;
    } else if (lowerTitle.contains('меню') || lowerTitle.contains('столов')) {
      return Icons.restaurant_menu;
    } else if (lowerTitle.contains('оценк') || lowerTitle.contains('успева')) {
      return Icons.grade;
    } else if (lowerTitle.contains('расписан')) {
      return Icons.calendar_today;
    } else {
      return Icons.info;
    }
  }
}


