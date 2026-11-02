import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive/hive.dart';
import 'package:primakov_app/models/api_models.dart';
import 'package:primakov_app/providers/canteen_provider.dart';
import 'package:primakov_app/providers/schedule_provider.dart';
import 'package:primakov_app/services/api/canteen_service.dart';
import 'package:primakov_app/services/api/schedule_service.dart';
import 'package:primakov_app/services/cache/offline_cache_service.dart';

class MockFailingScheduleService extends ScheduleService {
  @override
  Future<Schedule> getScheduleByDate(String groupId, String date) async {
    throw Exception('No internet connection');
  }
}

class MockSuccessScheduleService extends ScheduleService {
  final Schedule scheduleToReturn;
  MockSuccessScheduleService(this.scheduleToReturn);

  @override
  Future<Schedule> getScheduleByDate(String groupId, String date) async {
    return scheduleToReturn;
  }
}

class MockFailingCanteenService extends CanteenService {
  MockFailingCanteenService() : super(Dio());

  @override
  Future<List<CanteenMenu>> getTodaysMenuList() async {
    throw Exception('Network offline');
  }
}

class MockSuccessCanteenService extends CanteenService {
  final List<CanteenMenu> menusToReturn;
  MockSuccessCanteenService(this.menusToReturn) : super(Dio());

  @override
  Future<List<CanteenMenu>> getTodaysMenuList() async {
    return menusToReturn;
  }
}

void main() {
  late Directory tempDir;
  late OfflineCacheService cacheService;

  setUpAll(() async {
    tempDir = await Directory.systemTemp.createTemp('hive_notifier_test_');
    Hive.init(tempDir.path);
  });

  tearDownAll(() async {
    await Hive.close();
    if (tempDir.existsSync()) {
      await tempDir.delete(recursive: true);
    }
  });

  setUp(() async {
    cacheService = OfflineCacheService();
    await cacheService.init();
    await cacheService.clearAll();
  });

  group('ScheduleNotifier with Offline Cache', () {
    test('fetches from network and saves to cache', () async {
      final sampleSchedule = Schedule(
        id: 'sch-remote-1',
        groupId: '10A',
        date: '2026-11-02',
        lessons: [
          Lesson(
            id: 'l-1',
            subject: 'Химия',
            teacherId: 't-chem',
            startTime: '10:00',
            endTime: '10:45',
            room: '102',
            floor: 1,
            hasHomework: false,
          ),
        ],
      );

      final mockService = MockSuccessScheduleService(sampleSchedule);
      final notifier = ScheduleNotifier(mockService, cacheService: cacheService);

      await notifier.fetchSchedule('10A', '2026-11-02');

      expect(notifier.state.currentSchedule, isNotNull);
      expect(notifier.state.currentSchedule!.id, 'sch-remote-1');

      // Verify it was cached
      final cached = await cacheService.getSchedule('10A', '2026-11-02');
      expect(cached, isNotNull);
      expect(cached!.id, 'sch-remote-1');
    });

    test('retains cached schedule when network request fails (offline mode)', () async {
      final cachedSchedule = Schedule(
        id: 'sch-cached-offline',
        groupId: '10A',
        date: '2026-11-02',
        lessons: [
          Lesson(
            id: 'l-cached',
            subject: 'Геометрия',
            teacherId: 't-geom',
            startTime: '08:30',
            endTime: '09:15',
            room: '205',
            floor: 2,
            hasHomework: true,
          ),
        ],
      );
      await cacheService.saveSchedule('10A', '2026-11-02', cachedSchedule);

      final mockFailingService = MockFailingScheduleService();
      final notifier = ScheduleNotifier(mockFailingService, cacheService: cacheService);

      await notifier.fetchSchedule('10A', '2026-11-02');

      expect(notifier.state.currentSchedule, isNotNull);
      expect(notifier.state.currentSchedule!.id, 'sch-cached-offline');
      expect(notifier.state.isLoading, isFalse);
      expect(notifier.state.error, contains('No internet connection'));
    });
  });

  group('CanteenNotifier with Offline Cache', () {
    test('fetches today menu from network and caches it', () async {
      final sampleMenus = [
        CanteenMenu(
          id: 'menu-today-1',
          date: '2026-11-02',
          mealType: MealType.LUNCH,
          createdAt: '2026-11-02T08:00:00Z',
          items: [],
        ),
      ];

      final mockService = MockSuccessCanteenService(sampleMenus);
      final notifier = CanteenNotifier(mockService, cacheService: cacheService);

      await notifier.fetchTodayMenu();

      expect(notifier.state.todayMenu, isNotNull);
      expect(notifier.state.todayMenu!.length, 1);

      // Verify cached
      final cached = await cacheService.getTodaysMenu();
      expect(cached, isNotNull);
      expect(cached!.first.id, 'menu-today-1');
    });

    test('serves cached menu when network fails (offline)', () async {
      final cachedMenus = [
        CanteenMenu(
          id: 'menu-cached-today',
          date: '2026-11-02',
          mealType: MealType.BREAKFAST,
          createdAt: '2026-11-02T06:00:00Z',
          items: [
            CanteenMenuItem(
              id: 'it-1',
              name: 'Сырники',
              calories: 250,
              allergens: ['молоко'],
              isVegetarian: true,
              isVegan: false,
              displayOrder: 1,
            ),
          ],
        ),
      ];
      await cacheService.saveTodaysMenu(cachedMenus);

      final mockFailingService = MockFailingCanteenService();
      final notifier = CanteenNotifier(mockFailingService, cacheService: cacheService);

      await notifier.fetchTodayMenu();

      expect(notifier.state.todayMenu, isNotNull);
      expect(notifier.state.todayMenu!.first.id, 'menu-cached-today');
      expect(notifier.state.todayMenu!.first.items.first.name, 'Сырники');
      expect(notifier.state.isLoading, isFalse);
    });
  });
}
