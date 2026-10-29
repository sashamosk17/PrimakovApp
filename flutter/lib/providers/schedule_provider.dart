/// Schedule State Management
/// Converted from Redux scheduleSlice.ts

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/api_models.dart';
import '../services/api/schedule_service.dart';

/// Schedule State
class ScheduleState {
  final Schedule? currentSchedule;
  final bool isLoading;
  final String? error;

  const ScheduleState({
    this.currentSchedule,
    this.isLoading = false,
    this.error,
  });

  ScheduleState copyWith({
    Schedule? currentSchedule,
    bool? isLoading,
    String? error,
  }) {
    return ScheduleState(
      currentSchedule: currentSchedule ?? this.currentSchedule,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

/// Schedule Notifier
class ScheduleNotifier extends StateNotifier<ScheduleState> {
  final ScheduleService _service;

  ScheduleNotifier(this._service) : super(const ScheduleState());

  Future<void> fetchSchedule(String userId, String date) async {
  print('📡 ScheduleNotifier: fetchSchedule called with userId=$userId, date=$date');
  state = ScheduleState(
    currentSchedule: state.currentSchedule,
    isLoading: true,
    error: null,
  );
  try {
    final schedule = await _service.getScheduleByDate(userId, date);
    print('✅ ScheduleNotifier: received schedule with ${schedule.lessons.length} lessons');
    
    // 🔥 ДОБАВЛЕНО: Логируем состояние ДО и ПОСЛЕ
    print('📊 State before: currentSchedule=${state.currentSchedule != null}');
    
    state = ScheduleState(
      currentSchedule: schedule,
      isLoading: false,
      error: null,
    );
    
    print('📊 State after: currentSchedule=${state.currentSchedule != null}');
    print('📊 State after: lessons=${state.currentSchedule?.lessons.length}');
    
  } catch (e, stackTrace) {
    print('❌ ScheduleNotifier: error - $e');
    print('📚 Stack trace: $stackTrace');
    state = ScheduleState(
      currentSchedule: state.currentSchedule,
      isLoading: false,
      error: e.toString(),
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
  return ScheduleNotifier(service);
});

/// Schedule selectors
final currentScheduleProvider = Provider<Schedule?>((ref) =>
    ref.watch(scheduleProvider).currentSchedule);

final scheduleLessonsProvider = Provider<List<Lesson>>((ref) {
  final schedule = ref.watch(scheduleProvider).currentSchedule;
  return schedule?.lessons ?? [];
});

final scheduleLoadingProvider = Provider<bool>((ref) =>
    ref.watch(scheduleProvider).isLoading);

final scheduleErrorProvider = Provider<String?>((ref) =>
    ref.watch(scheduleProvider).error);
