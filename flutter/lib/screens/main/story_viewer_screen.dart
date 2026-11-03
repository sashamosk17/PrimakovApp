/// Story Viewer Screen - Modern Instagram/Telegram style story viewer
/// Immersive fullscreen canvas, frosted glass details card, interactive links, and gesture navigation.

import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/app_colors.dart';
import '../../models/api_models.dart';
import '../../providers/story_provider.dart';

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
  static const _storyDuration = 6; // seconds per story

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
    if (widget.stories.isEmpty) return;
    final story = widget.stories[_currentIndex];
    ref.read(storyProvider.notifier).markAsViewed(story.id);
  }

  void _pause() {
    if (!_isPaused) {
      setState(() {
        _isPaused = true;
      });
    }
  }

  void _resume() {
    if (_isPaused) {
      setState(() {
        _isPaused = false;
      });
    }
  }

  Future<void> _launchURL(String url) async {
    _pause();
    final uri = Uri.parse(url);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Не удалось открыть ссылку'),
              backgroundColor: AppColors.primaryRed,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        }
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Некорректный адрес ссылки'),
            backgroundColor: AppColors.primaryRed,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } finally {
      if (mounted) _resume();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.stories.isEmpty) {
      return const Scaffold(backgroundColor: Colors.black);
    }

    final story = widget.stories[_currentIndex];

    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onLongPressStart: (_) => _pause(),
        onLongPressEnd: (_) => _resume(),
        onVerticalDragEnd: (details) {
          // Swipe down to dismiss
          if (details.primaryVelocity != null && details.primaryVelocity! > 300) {
            HapticFeedback.lightImpact();
            Navigator.of(context).pop();
          }
        },
        onTapUp: (details) {
          final screenWidth = MediaQuery.of(context).size.width;
          final dx = details.globalPosition.dx;
          if (dx < screenWidth * 0.3) {
            _previousStory();
          } else if (dx > screenWidth * 0.7) {
            _nextStory();
          } else {
            // Tap middle toggles pause
            if (_isPaused) {
              _resume();
            } else {
              _pause();
            }
          }
        },
        child: Stack(
          fit: StackFit.expand,
          children: [
            // PageView Background Images / Content
            PageView.builder(
              controller: _pageController,
              onPageChanged: _onPageChanged,
              physics: const NeverScrollableScrollPhysics(), // Managed via tap & controller
              itemCount: widget.stories.length,
              itemBuilder: (context, index) {
                return _buildStoryVisual(widget.stories[index]);
              },
            ),

            // Subtle dark gradients top & bottom for readability
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              height: 160,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withOpacity(0.75),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),

            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              height: 240,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      Colors.black.withOpacity(0.85),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),

            // Top Header: Progress bars & School brand pill
            SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Progress Bars
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    child: Row(
                      children: List.generate(
                        widget.stories.length,
                        (index) => Expanded(
                          child: Container(
                            height: 3.5,
                            margin: const EdgeInsets.symmetric(horizontal: 2.5),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(3),
                            ),
                            child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor: index == _currentIndex
                                  ? _progress.clamp(0.0, 1.0)
                                  : (index < _currentIndex ? 1.0 : 0.0),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(3),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.white.withOpacity(0.5),
                                      blurRadius: 4,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Header Info & Close
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Row(
                      children: [
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(
                              colors: [Color(0xFFBA1A1A), Color(0xFF6B0000)],
                            ),
                            border: Border.all(color: Colors.white.withOpacity(0.6), width: 1.5),
                          ),
                          child: const Icon(
                            Icons.school_rounded,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Гимназия им. Е. М. Примакова',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: -0.2,
                                ),
                              ),
                              Text(
                                'Официальные истории',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.75),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.4),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white.withOpacity(0.2)),
                            ),
                            child: const Icon(Icons.close_rounded, color: Colors.white, size: 18),
                          ),
                          onPressed: () {
                            HapticFeedback.lightImpact();
                            Navigator.of(context).pop();
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Frosted Glass Bottom Overlay Card (Modern Instagram/Apple UI)
            Positioned(
              left: 16,
              right: 16,
              bottom: 28,
              child: SafeArea(
                top: false,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.55),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: Colors.white.withOpacity(0.18),
                          width: 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Story Title
                          Text(
                            story.title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.3,
                              height: 1.25,
                            ),
                          ),
                          if (story.description.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Text(
                              story.description,
                              maxLines: 4,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.88),
                                fontSize: 13.5,
                                height: 1.45,
                                letterSpacing: -0.1,
                              ),
                            ),
                          ],

                          // Interactive Link Button (if link present)
                          if (story.linkUrl != null && story.linkUrl!.trim().isNotEmpty) ...[
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                onPressed: () => _launchURL(story.linkUrl!.trim()),
                                icon: const Icon(Icons.arrow_outward_rounded, size: 16),
                                label: Text(
                                  story.linkText?.trim().isNotEmpty == true
                                      ? story.linkText!.trim()
                                      : 'Узнать подробнее',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: -0.1,
                                  ),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFBA1A1A),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 16),
                                  elevation: 4,
                                  shadowColor: const Color(0xFFBA1A1A).withOpacity(0.4),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Pause Indicator overlay
            if (_isPaused)
              Center(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.6),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white.withOpacity(0.25)),
                  ),
                  child: const Icon(
                    Icons.pause_rounded,
                    color: Colors.white,
                    size: 36,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStoryVisual(Story story) {
    if (story.imageUrl != null && story.imageUrl!.isNotEmpty) {
      final imgUrl = story.imageUrl!;
      if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
        return Image.network(
          imgUrl,
          fit: BoxFit.cover,
          loadingBuilder: (context, child, loadingProgress) {
            if (loadingProgress == null) return child;
            return _buildDefaultBackground(story.title);
          },
          errorBuilder: (context, error, stackTrace) {
            return _buildDefaultBackground(story.title);
          },
        );
      } else {
        return Image.asset(
          imgUrl,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return _buildDefaultBackground(story.title);
          },
        );
      }
    }

    return _buildDefaultBackground(story.title);
  }

  Widget _buildDefaultBackground(String title) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF8B0000), // Primakov Deep Red
            Color(0xFF38000A), // Rich Bordeaux Dark
            Color(0xFF1A0005), // Night
          ],
        ),
      ),
      child: Center(
        child: Container(
          width: 140,
          height: 140,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white.withOpacity(0.06),
            border: Border.all(color: Colors.white.withOpacity(0.15)),
          ),
          child: const Icon(
            Icons.school_rounded,
            size: 64,
            color: Colors.white38,
          ),
        ),
      ),
    );
  }
}
