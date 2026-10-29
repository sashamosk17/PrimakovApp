/// Auth State Management
/// Converted from Redux authSlice.ts using Riverpod/Provider

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/api_models.dart';
import '../services/api/auth_service.dart';
import '../services/api/user_service.dart';
import '../config/api_config.dart';

/// Auth State — добавляем currentUser
class AuthState {
  final String? userId;
  final String? token;
  final UserRole? userRole;
  final User? currentUser;   // ← НОВОЕ ПОЛЕ
  final bool isLoading;
  final String? error;

  const AuthState({
    this.userId,
    this.token,
    this.userRole,
    this.currentUser,          // ← добавить в конструктор
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    String? userId,
    String? token,
    UserRole? userRole,
    User? currentUser,         // ← добавить в copyWith
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) {
    return AuthState(
      userId: userId ?? this.userId,
      token: token ?? this.token,
      userRole: userRole ?? this.userRole,
      currentUser: currentUser ?? this.currentUser,  // ← добавить
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }

  bool get isAuthenticated => token != null && userId != null;
  bool get isAdmin => userRole == UserRole.ADMIN;
  String? get role => userRole?.name;
}

/// Auth Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final UserService _userService;
  static const String _tokenKey = 'auth_token';
  static const String _userIdKey = 'user_id';
  static const String _userRoleKey = 'user_role';
  static const String _userNameKey = 'user_name';
  static const String _userEmailKey = 'user_email';

  AuthNotifier(this._authService, this._userService) : super(const AuthState()) {
    // Automatically logout if any backend call returns 401 (e.g. token expired)
    ApiConfig.onUnauthorized = () {
      logout();
    };
    _loadSavedAuth();
  }

  Future<void> _loadSavedAuth() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(_tokenKey);
      final userId = prefs.getString(_userIdKey);
      final roleString = prefs.getString(_userRoleKey);
      final cachedName = prefs.getString(_userNameKey);
      final cachedEmail = prefs.getString(_userEmailKey);

      if (token != null && userId != null && roleString != null) {
        ApiConfig.setToken(token);
        final role = UserRole.values.firstWhere(
          (e) => e.name == roleString,
          orElse: () => UserRole.STUDENT,
        );

        // Pre-populate with cached user data so profile name is never stuck on 'Загрузка...'
        User? initialUser;
        if (cachedName != null && cachedName.isNotEmpty) {
          final parts = cachedName.split(' ');
          initialUser = User(
            id: userId,
            email: cachedEmail ?? '',
            role: role,
            firstName: parts.isNotEmpty ? parts[0] : '',
            lastName: parts.length > 1 ? parts.sublist(1).join(' ') : '',
            isActive: true,
          );
        }

        state = state.copyWith(
          userId: userId,
          token: token,
          userRole: role,
          currentUser: initialUser,
        );

        // Fetch fresh profile from API
        try {
          final user = await _userService.getCurrentUser();
          await _saveUserCache(user);
          state = state.copyWith(currentUser: user);
        } catch (e) {
          final errStr = e.toString().toLowerCase();
          if (errStr.contains('401') || errStr.contains('token expired') || errStr.contains('auth_error')) {
            // Token has expired on server: clear stale session and return to login
            await logout();
            return;
          }
        }
      }
    } catch (e) {
      // Ignore errors during load
    }
  }

  Future<void> _saveUserCache(User user) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_userNameKey, user.fullName);
      await prefs.setString(_userEmailKey, user.email);
    } catch (_) {}
  }

  Future<void> _saveAuth(String token, String userId, UserRole role) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userIdKey, userId);
    await prefs.setString(_userRoleKey, role.name);
  }

  Future<void> _clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userIdKey);
    await prefs.remove(_userRoleKey);
    await prefs.remove(_userNameKey);
    await prefs.remove(_userEmailKey);
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _authService.login(email, password);
      // Set token in global Dio instance
      ApiConfig.setToken(response.token);
      // Save to persistent storage
      await _saveAuth(response.token, response.user.id, response.user.role);
      await _saveUserCache(response.user);
      state = state.copyWith(
        userId: response.user.id,
        token: response.token,
        userRole: response.user.role,
        currentUser: response.user,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      rethrow;
    }
  }

  Future<void> register(String email, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _authService.register(email, password);
      // Set token in global Dio instance
      ApiConfig.setToken(response.token);
      // Save to persistent storage
      await _saveAuth(response.token, response.user.id, response.user.role);
      await _saveUserCache(response.user);
      state = state.copyWith(
        userId: response.user.id,
        token: response.token,
        userRole: response.user.role,
        currentUser: response.user,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      rethrow;
    }
  }

  /// Manually refresh current user profile
  Future<void> fetchCurrentUser() async {
    try {
      final user = await _userService.getCurrentUser();
      await _saveUserCache(user);
      state = state.copyWith(currentUser: user);
    } catch (e) {
      final errStr = e.toString().toLowerCase();
      if (errStr.contains('401') || errStr.contains('token expired')) {
        await logout();
      }
    }
  }

  /// Вызывается из ProfileNotifier после успешного updateProfile
  void updateCurrentUser(User updatedUser) {
    state = state.copyWith(currentUser: updatedUser);
  }

  Future<void> logout() async {
    // Clear token from global Dio instance
    ApiConfig.clearToken();
    // Clear from persistent storage
    await _clearAuth();
    state = const AuthState();
  }

  void setLoading(bool isLoading) {
    state = state.copyWith(isLoading: isLoading);
  }

  void setError(String? error) {
    state = state.copyWith(error: error);
  }
}

/// Auth Service Provider
final authServiceProvider = Provider((ref) => AuthService());

/// User Service Provider
final userServiceProvider = Provider((ref) => UserService());

/// Auth State Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  final userService = ref.watch(userServiceProvider);
  return AuthNotifier(authService, userService);
});

/// Auth selectors
final userIdProvider = Provider<String?>((ref) => ref.watch(authProvider).userId);
final tokenProvider = Provider<String?>((ref) => ref.watch(authProvider).token);
final userRoleProvider = Provider<UserRole?>((ref) => ref.watch(authProvider).userRole);
final isAuthenticatedProvider = Provider<bool>((ref) =>
    ref.watch(authProvider).isAuthenticated);
final authLoadingProvider = Provider<bool>((ref) =>
    ref.watch(authProvider).isLoading);
final authErrorProvider = Provider<String?>((ref) =>
    ref.watch(authProvider).error);

// Добавляем селектор для удобного доступа к currentUser
final currentUserProvider = Provider<User?>((ref) =>
    ref.watch(authProvider).currentUser);
