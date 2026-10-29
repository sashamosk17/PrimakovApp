/// UI State Management
/// Converted from Redux uiSlice.ts

import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/api_models.dart';
import '../services/api/user_service.dart';
import 'user_provider.dart';

/// UI State
class UIState {
  final bool isDarkMode;
  final String selectedTab;
  final bool isLoading;
  final NotificationSettings notificationSettings;

  const UIState({
    this.isDarkMode = false,
    this.selectedTab = 'schedule',
    this.isLoading = false,
    this.notificationSettings = const NotificationSettings(),
  });

  UIState copyWith({
    bool? isDarkMode,
    String? selectedTab,
    bool? isLoading,
    NotificationSettings? notificationSettings,
  }) {
    return UIState(
      isDarkMode: isDarkMode ?? this.isDarkMode,
      selectedTab: selectedTab ?? this.selectedTab,
      isLoading: isLoading ?? this.isLoading,
      notificationSettings: notificationSettings ?? this.notificationSettings,
    );
  }
}

/// UI Notifier with persistence and cloud synchronization
class UINotifier extends StateNotifier<UIState> {
  final UserService? _userService;

  UINotifier([this._userService]) : super(const UIState()) {
    _loadPreferences();
  }

  static const String _darkModeKey = 'isDarkMode';
  static const String _notificationSettingsKey = 'notificationSettings';
  bool _isInitialized = false;

  Future<void> _loadPreferences() async {
    if (_isInitialized) return;
    
    try {
      final prefs = await SharedPreferences.getInstance();
      final isDarkMode = prefs.getBool(_darkModeKey) ?? false;
      
      // Load notification settings from local cache
      final notificationSettingsJson = prefs.getString(_notificationSettingsKey);
      NotificationSettings notificationSettings = notificationSettingsJson != null
          ? NotificationSettings.fromJson(
              jsonDecode(notificationSettingsJson) as Map<String, dynamic>
            )
          : const NotificationSettings();

      state = state.copyWith(
        isDarkMode: isDarkMode,
        notificationSettings: notificationSettings,
      );
      _isInitialized = true;

      // Try syncing with remote API if user service is provided
      if (_userService != null) {
        try {
          final remoteSettings = await _userService!.getNotificationSettings();
          state = state.copyWith(notificationSettings: remoteSettings);
          await prefs.setString(_notificationSettingsKey, jsonEncode(remoteSettings.toJson()));
        } catch (_) {
          // Keep local cached settings if offline
        }
      }
    } catch (e) {
      // If loading fails, use default values
      state = state.copyWith(
        isDarkMode: false,
        notificationSettings: const NotificationSettings(),
      );
      _isInitialized = true;
    }
  }

  Future<void> toggleDarkMode() async {
    final newValue = !state.isDarkMode;
    state = state.copyWith(isDarkMode: newValue);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_darkModeKey, newValue);
  }

  Future<void> setDarkMode(bool isDarkMode) async {
    state = state.copyWith(isDarkMode: isDarkMode);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_darkModeKey, isDarkMode);
  }

  void setSelectedTab(String tab) {
    state = state.copyWith(selectedTab: tab);
  }

  void setLoading(bool isLoading) {
    state = state.copyWith(isLoading: isLoading);
  }

  // Notification settings methods
  Future<void> updateNotificationSettings(NotificationSettings settings) async {
    try {
      state = state.copyWith(notificationSettings: settings);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_notificationSettingsKey, jsonEncode(settings.toJson()));

      if (_userService != null) {
        try {
          await _userService!.updateNotificationSettings(settings);
        } catch (err) {
          print('Remote sync notification settings error: $err');
        }
      }
    } catch (e) {
      // Handle save error - could show a snackbar or log
      print('Error saving notification settings: $e');
    }
  }

  Future<void> togglePushNotifications() async {
    final currentSettings = state.notificationSettings;
    final newSettings = currentSettings.copyWith(
      pushEnabled: !currentSettings.pushEnabled,
    );
    await updateNotificationSettings(newSettings);
  }

  Future<void> toggleDeadlineNotifications() async {
    final currentSettings = state.notificationSettings;
    final newSettings = currentSettings.copyWith(
      deadlineNotifications: !currentSettings.deadlineNotifications,
    );
    await updateNotificationSettings(newSettings);
  }

  Future<void> toggleScheduleNotifications() async {
    final currentSettings = state.notificationSettings;
    final newSettings = currentSettings.copyWith(
      scheduleNotifications: !currentSettings.scheduleNotifications,
    );
    await updateNotificationSettings(newSettings);
  }

  Future<void> toggleAnnouncementNotifications() async {
    final currentSettings = state.notificationSettings;
    final newSettings = currentSettings.copyWith(
      announcementNotifications: !currentSettings.announcementNotifications,
    );
    await updateNotificationSettings(newSettings);
  }

  // Ensure settings are loaded before returning them
  Future<NotificationSettings> getNotificationSettings() async {
    if (!_isInitialized) {
      await _loadPreferences();
    }
    return state.notificationSettings;
  }
}

/// UI State Provider
final uiProvider = StateNotifierProvider<UINotifier, UIState>((ref) {
  final userService = ref.watch(userServiceProvider);
  return UINotifier(userService);
});

/// UI selectors
final isDarkModeProvider = Provider<bool>((ref) =>
    ref.watch(uiProvider).isDarkMode);

final selectedTabProvider = Provider<String>((ref) =>
    ref.watch(uiProvider).selectedTab);

final uiLoadingProvider = Provider<bool>((ref) =>
    ref.watch(uiProvider).isLoading);

final notificationSettingsProvider = Provider<NotificationSettings>((ref) =>
    ref.watch(uiProvider).notificationSettings);
