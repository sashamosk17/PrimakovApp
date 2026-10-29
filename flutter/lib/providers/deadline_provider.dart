import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/api_models.dart';
import '../services/api/deadline_service.dart';

/// Deadline State
class DeadlineState {
  final List<Deadline> items;
  final bool isLoading;
  final String? error;

  const DeadlineState({
    this.items = const [],
    this.isLoading = false,
    this.error,
  });

  DeadlineState copyWith({
    List<Deadline>? items,
    bool? isLoading,
    String? error,
  }) {
    return DeadlineState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

/// Deadline Notifier
class DeadlineNotifier extends StateNotifier<DeadlineState> {
  final DeadlineService _service;

  DeadlineNotifier(this._service) : super(const DeadlineState());

  Future<void> fetchDeadlines(String userId, {String? status}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final deadlines = await _service.getDeadlines(userId, status: status);
      state = state.copyWith(
        items: deadlines,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> createDeadline(Deadline deadline) async {
    try {
      final newDeadline = await _service.createDeadline(deadline);
      state = state.copyWith(
        items: [...state.items, newDeadline],
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }

  // 🔥 ИСПРАВЛЕННЫЙ МЕТОД (без лишних полей)
  Future<void> completeDeadline(String deadlineId) async {
    try {
      await _service.completeDeadline(deadlineId);
      
      // Обновляем статус локально
      final updatedItems = state.items.map((deadline) {
        if (deadline.id == deadlineId) {
          // Создаем новый объект Deadline с обновленным статусом
          final newStatus = deadline.status == DeadlineStatus.PENDING 
              ? DeadlineStatus.COMPLETED 
              : DeadlineStatus.PENDING;
              
          // Возвращаем новый объект ТОЛЬКО с существующими полями
          return Deadline(
            id: deadline.id,
            title: deadline.title,
            description: deadline.description,
            dueDate: deadline.dueDate,
            userId: deadline.userId,
            status: newStatus,
            subject: deadline.subject,
            createdAt: deadline.createdAt,
            completedAt: newStatus == DeadlineStatus.COMPLETED 
                ? DateTime.now().toIso8601String() 
                : null,
          );
        }
        return deadline;
      }).toList();
      
      state = state.copyWith(items: updatedItems);
      print('✅ Deadline toggled locally: $deadlineId');
    } catch (e) {
      print('❌ Failed to complete deadline: $e');
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }

  void setDeadlines(List<Deadline> deadlines) {
    state = state.copyWith(items: deadlines);
  }

  void setLoading(bool isLoading) {
    state = state.copyWith(isLoading: isLoading);
  }

  void setError(String? error) {
    state = state.copyWith(error: error);
  }
}

/// Services Provider
final deadlineServiceProvider = Provider((ref) => DeadlineService());

/// Deadline State Provider
final deadlineProvider = StateNotifierProvider<DeadlineNotifier, DeadlineState>((ref) {
  final service = ref.watch(deadlineServiceProvider);
  return DeadlineNotifier(service);
});

/// Deadlines selectors
final allDeadlinesProvider = Provider<List<Deadline>>((ref) =>
    ref.watch(deadlineProvider).items);

final pendingDeadlinesProvider = Provider<List<Deadline>>((ref) {
  final deadlines = ref.watch(deadlineProvider).items;
  return deadlines
      .where((d) => d.status == DeadlineStatus.PENDING)
      .toList();
});

final completedDeadlinesProvider = Provider<List<Deadline>>((ref) {
  final deadlines = ref.watch(deadlineProvider).items;
  return deadlines
      .where((d) => d.status == DeadlineStatus.COMPLETED)
      .toList();
});

final deadlineLoadingProvider = Provider<bool>((ref) =>
    ref.watch(deadlineProvider).isLoading);

final deadlineErrorProvider = Provider<String?>((ref) =>
    ref.watch(deadlineProvider).error);