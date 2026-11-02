import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import '../../models/api_models.dart';

class OfflineCacheService {
  static const String scheduleBoxName = 'schedule_box';
  static const String canteenBoxName = 'canteen_box';
  static const String metaBoxName = 'cache_meta_box';

  Box? _scheduleBox;
  Box? _canteenBox;
  Box? _metaBox;

  bool get isInitialized =>
      _scheduleBox != null && _canteenBox != null && _metaBox != null;

  Future<void> init() async {
    if (isInitialized) return;

    if (!Hive.isBoxOpen(scheduleBoxName)) {
      _scheduleBox = await Hive.openBox(scheduleBoxName);
    } else {
      _scheduleBox = Hive.box(scheduleBoxName);
    }

    if (!Hive.isBoxOpen(canteenBoxName)) {
      _canteenBox = await Hive.openBox(canteenBoxName);
    } else {
      _canteenBox = Hive.box(canteenBoxName);
    }

    if (!Hive.isBoxOpen(metaBoxName)) {
      _metaBox = await Hive.openBox(metaBoxName);
    } else {
      _metaBox = Hive.box(metaBoxName);
    }
  }

  String _scheduleKey(String groupId, String date) => '${groupId}_$date';

  Future<void> saveSchedule(String groupId, String date, Schedule schedule) async {
    await _ensureInit();
    final key = _scheduleKey(groupId, date);
    final jsonStr = jsonEncode(schedule.toJson());
    await _scheduleBox!.put(key, jsonStr);
    await _metaBox!.put('meta_schedule_$key', DateTime.now().toIso8601String());
  }

  Future<Schedule?> getSchedule(String groupId, String date) async {
    await _ensureInit();
    final key = _scheduleKey(groupId, date);
    final raw = _scheduleBox!.get(key);
    if (raw == null) return null;

    try {
      final map = jsonDecode(raw as String) as Map<String, dynamic>;
      return Schedule.fromJson(map);
    } catch (e) {
      return null;
    }
  }

  DateTime? getScheduleLastUpdated(String groupId, String date) {
    if (_metaBox == null) return null;
    final key = _scheduleKey(groupId, date);
    final raw = _metaBox!.get('meta_schedule_$key');
    if (raw == null) return null;
    return DateTime.tryParse(raw as String);
  }

  Future<void> saveTodaysMenu(List<CanteenMenu> menus) async {
    await _ensureInit();
    final listJson = menus.map((m) => m.toJson()).toList();
    await _canteenBox!.put('today', jsonEncode(listJson));
    await _metaBox!.put('meta_canteen_today', DateTime.now().toIso8601String());
  }

  Future<List<CanteenMenu>?> getTodaysMenu() async {
    await _ensureInit();
    final raw = _canteenBox!.get('today');
    if (raw == null) return null;

    try {
      final decoded = jsonDecode(raw as String) as List<dynamic>;
      return decoded.map((e) => CanteenMenu.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      return null;
    }
  }

  Future<void> saveMenuForDate(String date, List<CanteenMenu> menus) async {
    await _ensureInit();
    final listJson = menus.map((m) => m.toJson()).toList();
    await _canteenBox!.put('menu_$date', jsonEncode(listJson));
    await _metaBox!.put('meta_canteen_$date', DateTime.now().toIso8601String());
  }

  Future<List<CanteenMenu>?> getMenuForDate(String date) async {
    await _ensureInit();
    final raw = _canteenBox!.get('menu_$date');
    if (raw == null) return null;

    try {
      final decoded = jsonDecode(raw as String) as List<dynamic>;
      return decoded.map((e) => CanteenMenu.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      return null;
    }
  }

  DateTime? getCanteenLastUpdated([String? date]) {
    if (_metaBox == null) return null;
    final key = date == null ? 'meta_canteen_today' : 'meta_canteen_$date';
    final raw = _metaBox!.get(key);
    if (raw == null) return null;
    return DateTime.tryParse(raw as String);
  }

  Future<void> clearAll() async {
    await _ensureInit();
    await _scheduleBox!.clear();
    await _canteenBox!.clear();
    await _metaBox!.clear();
  }

  Future<void> _ensureInit() async {
    if (!isInitialized) {
      await init();
    }
  }
}

final offlineCacheServiceProvider = Provider<OfflineCacheService>((ref) {
  return OfflineCacheService();
});

