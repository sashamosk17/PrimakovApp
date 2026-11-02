import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive/hive.dart';
import 'package:primakov_app/models/api_models.dart';
import 'package:primakov_app/services/cache/offline_cache_service.dart';

void main() {
  late Directory tempDir;
  late OfflineCacheService cacheService;

  setUpAll(() async {
    tempDir = await Directory.systemTemp.createTemp('hive_test_');
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

  group('OfflineCacheService - Schedule', () {
    test('returns null when no cached schedule exists', () async {
      final cached = await cacheService.getSchedule('group-1', '2026-11-02');
      expect(cached, isNull);
    });

    test('saves and retrieves schedule correctly', () async {
      final sampleSchedule = Schedule(
        id: 'sch-1',
        groupId: 'group-10A',
        date: '2026-11-02',
        lessons: [
          Lesson(
            id: 'les-1',
            subject: 'Математика',
            teacherId: 't-1',
            teacherName: 'Иванова М.И.',
            startTime: '08:30',
            endTime: '09:15',
            room: '301',
            floor: 3,
            hasHomework: true,
            homeworkDescription: 'Параграф 14, № 120-125',
          ),
          Lesson(
            id: 'les-2',
            subject: 'Физика',
            teacherId: 't-2',
            teacherName: 'Петров В.С.',
            startTime: '09:25',
            endTime: '10:10',
            room: '204',
            floor: 2,
            hasHomework: false,
          ),
        ],
      );

      await cacheService.saveSchedule('group-10A', '2026-11-02', sampleSchedule);
      final retrieved = await cacheService.getSchedule('group-10A', '2026-11-02');

      expect(retrieved, isNotNull);
      expect(retrieved!.id, 'sch-1');
      expect(retrieved.groupId, 'group-10A');
      expect(retrieved.date, '2026-11-02');
      expect(retrieved.lessons.length, 2);
      expect(retrieved.lessons.first.subject, 'Математика');
      expect(retrieved.lessons.first.room, '301');
      expect(retrieved.lessons.first.hasHomework, true);
    });

    test('stores and checks cache timestamp for schedule', () async {
      final sampleSchedule = Schedule(
        id: 'sch-ts',
        groupId: 'group-10A',
        date: '2026-11-02',
        lessons: [],
      );

      await cacheService.saveSchedule('group-10A', '2026-11-02', sampleSchedule);
      final timestamp = cacheService.getScheduleLastUpdated('group-10A', '2026-11-02');

      expect(timestamp, isNotNull);
      expect(DateTime.now().difference(timestamp!).inMinutes < 1, isTrue);
    });
  });

  group('OfflineCacheService - Canteen Menu', () {
    test('returns null when no cached canteen menu exists', () async {
      final cached = await cacheService.getTodaysMenu();
      expect(cached, isNull);
    });

    test('saves and retrieves today canteen menus correctly', () async {
      final sampleMenus = [
        CanteenMenu(
          id: 'menu-1',
          date: '2026-11-02',
          mealType: MealType.LUNCH,
          createdAt: '2026-11-02T07:00:00Z',
          items: [
            CanteenMenuItem(
              id: 'item-1',
              name: 'Борщ сибирский',
              description: 'Со сметаной и зеленью',
              category: 'Первые блюда',
              calories: 220,
              protein: 8.5,
              carbs: 18.0,
              fat: 9.2,
              weight: 250,
              allergens: ['молоко'],
              isVegetarian: false,
              isVegan: false,
              displayOrder: 1,
            ),
            CanteenMenuItem(
              id: 'item-2',
              name: 'Гречка с овощами',
              category: 'Гарниры',
              calories: 180,
              allergens: [],
              isVegetarian: true,
              isVegan: true,
              displayOrder: 2,
            ),
          ],
        ),
      ];

      await cacheService.saveTodaysMenu(sampleMenus);
      final retrieved = await cacheService.getTodaysMenu();

      expect(retrieved, isNotNull);
      expect(retrieved!.length, 1);
      expect(retrieved.first.mealType, MealType.LUNCH);
      expect(retrieved.first.items.length, 2);
      expect(retrieved.first.items.first.name, 'Борщ сибирский');
      expect(retrieved.first.items.first.calories, 220);
      expect(retrieved.first.items[1].isVegetarian, isTrue);
    });

    test('saves and retrieves canteen menu by specific date', () async {
      final sampleMenus = [
        CanteenMenu(
          id: 'menu-date',
          date: '2026-11-03',
          mealType: MealType.BREAKFAST,
          createdAt: '2026-11-02T12:00:00Z',
          items: [
            CanteenMenuItem(
              id: 'item-bf',
              name: 'Овсяная каша с ягодами',
              calories: 210,
              allergens: ['глютен', 'молоко'],
              isVegetarian: true,
              isVegan: false,
              displayOrder: 1,
            ),
          ],
        ),
      ];

      await cacheService.saveMenuForDate('2026-11-03', sampleMenus);
      final retrieved = await cacheService.getMenuForDate('2026-11-03');

      expect(retrieved, isNotNull);
      expect(retrieved!.first.items.first.name, 'Овсяная каша с ягодами');
    });

    test('clearAll removes all cached schedules and menus', () async {
      final sampleSchedule = Schedule(
        id: 'sch-clear',
        groupId: 'group-1',
        date: '2026-11-02',
        lessons: [],
      );
      await cacheService.saveSchedule('group-1', '2026-11-02', sampleSchedule);
      await cacheService.saveTodaysMenu([]);

      await cacheService.clearAll();

      expect(await cacheService.getSchedule('group-1', '2026-11-02'), isNull);
      expect(await cacheService.getTodaysMenu(), isNull);
    });
  });
}

