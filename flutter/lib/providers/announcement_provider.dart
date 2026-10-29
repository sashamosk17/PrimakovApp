/// Announcement State Management
/// Converted from Redux announcementSlice.ts

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/api_models.dart';
import '../services/api/announcement_service.dart';

/// Announcement State
class AnnouncementState {
  final List<Announcement> items;
  final bool isLoading;
  final String? error;

  const AnnouncementState({
    this.items = const [],
    this.isLoading = false,
    this.error,
  });

  AnnouncementState copyWith({
    List<Announcement>? items,
    bool? isLoading,
    String? error,
  }) {
    return AnnouncementState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

/// Announcement Notifier
class AnnouncementNotifier extends StateNotifier<AnnouncementState> {
  final AnnouncementService _service;

  AnnouncementNotifier(this._service) : super(const AnnouncementState());

  Future<void> fetchAnnouncements() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final announcements = await _service.getAnnouncements();
      state = state.copyWith(
        items: announcements,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<Announcement?> fetchByCategory(String category) async {
    try {
      return await _service.getAnnouncementByCategory(category);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  void setAnnouncements(List<Announcement> announcements) {
    state = state.copyWith(items: announcements);
  }

  void setLoading(bool isLoading) {
    state = state.copyWith(isLoading: isLoading);
  }

  void setError(String? error) {
    state = state.copyWith(error: error);
  }
}

/// Services Provider
final announcementServiceProvider = Provider((ref) => AnnouncementService());

/// Announcement State Provider
final announcementProvider = StateNotifierProvider<AnnouncementNotifier, AnnouncementState>((ref) {
  final service = ref.watch(announcementServiceProvider);
  return AnnouncementNotifier(service);
});

/// Announcement selectors
final allAnnouncementsProvider = Provider<List<Announcement>>((ref) =>
    ref.watch(announcementProvider).items);

final announcementLoadingProvider = Provider<bool>((ref) =>
    ref.watch(announcementProvider).isLoading);

final announcementErrorProvider = Provider<String?>((ref) =>
    ref.watch(announcementProvider).error);
