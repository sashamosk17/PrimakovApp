/// Story State Management
/// Converted from Redux storySlice.ts

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/api_models.dart';
import '../services/api/story_service.dart';

/// Story State
class StoryState {
  final List<Story> items;
  final bool isLoading;
  final String? error;

  const StoryState({
    this.items = const [],
    this.isLoading = false,
    this.error,
  });

  StoryState copyWith({
    List<Story>? items,
    bool? isLoading,
    String? error,
  }) {
    return StoryState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

/// Story Notifier
class StoryNotifier extends StateNotifier<StoryState> {
  final StoryService _service;

  StoryNotifier(this._service) : super(const StoryState());

  Future<void> fetchStories() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final stories = await _service.getAllStories();
      state = state.copyWith(
        items: stories,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> markAsViewed(String storyId) async {
    // Optimistically update UI first
    state = state.copyWith(
      items: state.items.map((s) {
        if (s.id == storyId) {
          return Story(
            id: s.id,
            title: s.title,
            description: s.description,
            imageUrl: s.imageUrl,
            videoUrl: s.videoUrl,
            viewedBy: [...s.viewedBy, 'current_user'],
            linkUrl: s.linkUrl,
            linkText: s.linkText,
          );
        }
        return s;
      }).toList(),
    );

    // Try to sync with backend, but don't fail if it's not available
    try {
      await _service.markStoryAsViewed(storyId);
    } catch (e) {
      // Silently ignore 404 errors for stories (backend might not have this endpoint yet)
      print('Story view sync failed (non-critical): $e');
    }
  }

  void setStories(List<Story> stories) {
    state = state.copyWith(items: stories);
  }

  void setLoading(bool isLoading) {
    state = state.copyWith(isLoading: isLoading);
  }

  void setError(String? error) {
    state = state.copyWith(error: error);
  }
}

/// Services Provider
final storyServiceProvider = Provider((ref) => StoryService());

/// Story State Provider
final storyProvider = StateNotifierProvider<StoryNotifier, StoryState>((ref) {
  final service = ref.watch(storyServiceProvider);
  return StoryNotifier(service);
});

/// Story selectors
final allStoriesProvider = Provider<List<Story>>((ref) =>
    ref.watch(storyProvider).items);

final storyLoadingProvider = Provider<bool>((ref) =>
    ref.watch(storyProvider).isLoading);

final storyErrorProvider = Provider<String?>((ref) =>
    ref.watch(storyProvider).error);
