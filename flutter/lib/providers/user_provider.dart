/// User Provider
/// State management for user-related data

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/api_models.dart';
import '../services/api/user_service.dart';
import 'auth_provider.dart';

final userServiceProvider = Provider((ref) => UserService());

final teachersProvider = FutureProvider<List<Teacher>>((ref) async {
  final userService = ref.watch(userServiceProvider);
  return userService.getTeachers();
});

/// Profile State
class ProfileState {
  final User? currentUser;
  final bool isLoading;
  final String? error;

  const ProfileState({
    this.currentUser,
    this.isLoading = false,
    this.error,
  });

  ProfileState copyWith({
    User? currentUser,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) {
    return ProfileState(
      currentUser: currentUser ?? this.currentUser,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

/// Profile Notifier - управление редактированием профиля
class ProfileNotifier extends StateNotifier<ProfileState> {
  final UserService _userService;
  final AuthNotifier _authNotifier;

  ProfileNotifier(this._userService, this._authNotifier) 
    : super(const ProfileState());

  /// Загрузить текущий профиль
  Future<void> loadProfile() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final user = await _userService.getCurrentUser();
      state = state.copyWith(
        currentUser: user,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Обновить профиль (имя, фамилия, аватар, 2FA)
  Future<void> updateProfile({
    String? firstName,
    String? lastName,
    String? avatarUrl,
    bool? twoFactorEnabled,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final updatedUser = await _userService.updateProfile(
        firstName: firstName,
        lastName: lastName,
        avatarUrl: avatarUrl,
        twoFactorEnabled: twoFactorEnabled,
      );
      
      state = state.copyWith(
        currentUser: updatedUser,
        isLoading: false,
      );

      // Синхронизируем с AuthNotifier
      _authNotifier.updateCurrentUser(updatedUser);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  /// Сменить пароль
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      await _userService.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
      
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }
}

/// Profile provider
final profileProvider = StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  final userService = ref.watch(userServiceProvider);
  final authNotifier = ref.watch(authProvider.notifier);
  return ProfileNotifier(userService, authNotifier);
});

/// Удобные селекторы
final profileCurrentUserProvider = Provider<User?>((ref) =>
    ref.watch(profileProvider).currentUser);
final profileLoadingProvider = Provider<bool>((ref) =>
    ref.watch(profileProvider).isLoading);
final profileErrorProvider = Provider<String?>((ref) =>
    ref.watch(profileProvider).error);

/// Sessions State Notifier
class SessionsNotifier extends StateNotifier<AsyncValue<List<UserSession>>> {
  final UserService _userService;

  SessionsNotifier(this._userService) : super(const AsyncValue.loading()) {
    loadSessions();
  }

  Future<void> loadSessions() async {
    state = const AsyncValue.loading();
    try {
      final sessions = await _userService.getSessions();
      state = AsyncValue.data(sessions);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> revokeSession(String sessionId) async {
    try {
      await _userService.revokeSession(sessionId);
      state.whenData((sessions) {
        state = AsyncValue.data(sessions.where((s) => s.id != sessionId).toList());
      });
    } catch (e) {
      rethrow;
    }
  }
}

/// Sessions provider
final sessionsProvider = StateNotifierProvider<SessionsNotifier, AsyncValue<List<UserSession>>>((ref) {
  final userService = ref.watch(userServiceProvider);
  return SessionsNotifier(userService);
});

/// Academic statistics provider
final userStatsProvider = FutureProvider<UserStats>((ref) async {
  final userService = ref.watch(userServiceProvider);
  return userService.getStats();
});
