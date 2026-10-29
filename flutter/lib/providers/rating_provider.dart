/// Rating State Management
/// Converted from Redux ratingSlice.ts

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/api_models.dart';
import '../services/api/rating_service.dart';

/// Rating State
class RatingState {
  final List<Rating> items;
  final bool isLoading;
  final String? error;

  const RatingState({
    this.items = const [],
    this.isLoading = false,
    this.error,
  });

  RatingState copyWith({
    List<Rating>? items,
    bool? isLoading,
    String? error,
  }) {
    return RatingState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

/// Rating Notifier
class RatingNotifier extends StateNotifier<RatingState> {
  final RatingService _service;

  RatingNotifier(this._service) : super(const RatingState());

  Future<void> fetchTeacherRatings(String teacherId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final ratings = await _service.getTeacherRatings(teacherId);
      state = state.copyWith(
        items: ratings,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> rateTeacher(
    String teacherId,
    double rate,
    String comment,
  ) async {
    try {
      final newRating = await _service.rateTeacher(
        teacherId,
        rate,
        comment,
      );
      state = state.copyWith(
        items: [...state.items, newRating],
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }

  void setRatings(List<Rating> ratings) {
    state = state.copyWith(items: ratings);
  }

  void setLoading(bool isLoading) {
    state = state.copyWith(isLoading: isLoading);
  }

  void setError(String? error) {
    state = state.copyWith(error: error);
  }
}

/// Services Provider
final ratingServiceProvider = Provider((ref) => RatingService());

/// Rating State Provider
final ratingProvider = StateNotifierProvider<RatingNotifier, RatingState>((ref) {
  final service = ref.watch(ratingServiceProvider);
  return RatingNotifier(service);
});

/// Rating selectors
final allRatingsProvider = Provider<List<Rating>>((ref) =>
    ref.watch(ratingProvider).items);

final averageRatingProvider = Provider<double>((ref) {
  final ratings = ref.watch(ratingProvider).items;
  if (ratings.isEmpty) return 0.0;
  final total = ratings.fold<double>(0, (sum, r) => sum + r.rate);
  return total / ratings.length;
});

final ratingLoadingProvider = Provider<bool>((ref) =>
    ref.watch(ratingProvider).isLoading);

final ratingErrorProvider = Provider<String?>((ref) =>
    ref.watch(ratingProvider).error);
