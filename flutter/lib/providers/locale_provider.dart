import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocaleNotifier extends StateNotifier<Locale> {
  static const String _prefKey = 'app_language_code';

  LocaleNotifier() : super(const Locale('ru', 'RU')) {
    _loadSavedLocale();
  }

  Future<void> _loadSavedLocale() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedCode = prefs.getString(_prefKey);
      if (savedCode != null) {
        if (savedCode == 'en') {
          state = const Locale('en', 'US');
        } else {
          state = const Locale('ru', 'RU');
        }
      }
    } catch (e) {
      // Fallback to Russian
      state = const Locale('ru', 'RU');
    }
  }

  Future<void> setLocale(Locale newLocale) async {
    state = newLocale;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefKey, newLocale.languageCode);
    } catch (e) {
      // Persistence error ignored in tests
    }
  }

  Future<void> toggleLocale() async {
    if (state.languageCode == 'ru') {
      await setLocale(const Locale('en', 'US'));
    } else {
      await setLocale(const Locale('ru', 'RU'));
    }
  }
}

final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  return LocaleNotifier();
});

