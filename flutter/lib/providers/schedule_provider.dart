/// Schedule State Management
/// Converted from Redux scheduleSlice.ts

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/api_models.dart';
import '../services/api/schedule_service.dart';
import '../services/cache/offline_cache_service.dart';

/// Schedule State
class ScheduleState {
  final Schedule? currentSchedule;
  final bool isLoading;
  final String? error;
  final bool isFromCache;
  final DateTime? lastCachedAt;

  const ScheduleState({
    this.currentSchedule,
    this.isLoading = false,
    this.error,
    this.isFromCache = false,
    this.lastCachedAt,
  });

  ScheduleState copyWith({
    Schedule? currentSchedule,
    bool? isLoading,
    String? error,
    bool? isFromCache,
    DateTime? lastCachedAt,
  }) {
    return ScheduleState(
      currentSchedule: currentSchedule ?? this.currentSchedule,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      isFromCache: isFromCache ?? this.isFromCache,
      lastCachedAt: lastCachedAt ?? this.lastCachedAt,
    );
  }
}

/// Schedule Notifier
class ScheduleNotifier extends StateNotifier<ScheduleState> {
  final ScheduleService _service;
  final OfflineCacheService? _cacheService;

  ScheduleNotifier(this._service, {OfflineCacheService? cacheService})
      : _cacheService = cacheService,
        super(const ScheduleState());

  Future<void> fetchSchedule(String userId, String date) async {
    print('📡 ScheduleNotifier: fetchSchedule called with userId=$userId, date=$date');
    
    // Check offline cache first for instant UI response
    if (_cacheService != null) {
      final cached = await _cacheService!.getSchedule(userId, date);
      final lastUpdated = _cacheService!.getScheduleLastUpdated(userId, date);
      if (cached != null) {
        state = state.copyWith(
          currentSchedule: cached,
          isLoading: true,
          error: null,
          isFromCache: true,
          lastCachedAt: lastUpdated,
        );
      } else {
        state = state.copyWith(isLoading: true, error: null, isFromCache: false);
      }
    } else {
      state = state.copyWith(isLoading: true, error: null, isFromCache: false);
    }

    try {
      final schedule = await _service.getScheduleByDate(userId, date);
      print('✅ ScheduleNotifier: received schedule with ${schedule.lessons.length} lessons');

      if (_cacheService != null) {
        await _cacheService!.saveSchedule(userId, date, schedule);
      }

      state = ScheduleState(
        currentSchedule: schedule,
        isLoading: false,
        error: null,
        isFromCache: false,
        lastCachedAt: DateTime.now(),
      );
    } catch (e, stackTrace) {
      print('❌ ScheduleNotifier: error - $e');
      print('📚 Stack trace: $stackTrace');
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
        isFromCache: state.currentSchedule != null,
      );
    }
  }

  Future<Lesson?> fetchLessonDetails(String lessonId) async {
    try {
      return await _service.getLessonDetails(lessonId);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  void setSchedule(Schedule schedule) {
    state = state.copyWith(currentSchedule: schedule);
  }

  void setLoading(bool isLoading) {
    state = state.copyWith(isLoading: isLoading);
  }

  void setError(String? error) {
    state = state.copyWith(error: error);
  }
}

/// Services Provider
final scheduleServiceProvider = Provider((ref) => ScheduleService());

/// Schedule State Provider
final scheduleProvider = StateNotifierProvider<ScheduleNotifier, ScheduleState>((ref) {
  final service = ref.watch(scheduleServiceProvider);
  final cacheService = ref.watch(offlineCacheServiceProvider);
  return ScheduleNotifier(service, cacheService: cacheService);
});

/// Convenience Providers
final currentScheduleProvider = Provider<Schedule?>((ref) {
  return ref.watch(scheduleProvider).currentSchedule;
});

final scheduleLoadingProvider = Provider<bool>((ref) {
  return ref.watch(scheduleProvider).isLoading;
});

final scheduleErrorProvider = Provider<String?>((ref) {
  return ref.watch(scheduleProvider).error;
});
