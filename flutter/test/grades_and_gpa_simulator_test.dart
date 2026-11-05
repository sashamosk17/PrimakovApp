import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive/hive.dart';
import 'package:primakov_app/models/api_models.dart';
import 'package:primakov_app/providers/grades_provider.dart';
import 'package:primakov_app/services/api/grades_service.dart';
import 'package:primakov_app/services/cache/offline_cache_service.dart';

class MockSuccessGradesService extends GradesService {
  final List<SubjectGradeSummary> mockSummaries;
  MockSuccessGradesService(this.mockSummaries);

  @override
  Future<List<SubjectGradeSummary>> getMyGrades({String? period}) async {
    return mockSummaries;
  }
}

class MockFailingGradesService extends GradesService {
  @override
  Future<List<SubjectGradeSummary>> getMyGrades({String? period}) async {
    throw Exception('No internet connection');
  }
}

void main() {
  late Directory tempDir;
  late OfflineCacheService cacheService;

  final sampleGrades = [
    GradeItem(
      id: 'g-1',
      studentId: 'std-1',
      subjectId: 'algebra',
      subjectName: 'Алгебра',
      value: 5,
      weight: 1.0,
      date: '2026-10-01T10:00:00Z',
      period: '1 триместр',
      topic: 'Устный опрос',
    ),
    GradeItem(
      id: 'g-2',
      studentId: 'std-1',
      subjectId: 'algebra',
      subjectName: 'Алгебра',
      value: 4,
      weight: 1.0,
      date: '2026-10-05T10:00:00Z',
      period: '1 триместр',
      topic: 'Самостоятельная работа',
    ),
    GradeItem(
      id: 'g-3',
      studentId: 'std-1',
      subjectId: 'algebra',
      subjectName: 'Алгебра',
      value: 5,
      weight: 2.0,
      date: '2026-10-15T10:00:00Z',
      period: '1 триместр',
      topic: 'Контрольная работа',
    ),
  ];

  final sampleSummary = SubjectGradeSummary(
    subjectName: 'Алгебра',
    grades: sampleGrades,
    averageScore: 4.75,
    periodMark: 5,
  );

  setUpAll(() async {
    tempDir = await Directory.systemTemp.createTemp('hive_grades_test_');
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
  });

  group('Grades Models & Calculations', () {
    test('SubjectGradeSummary correctly computes weighted average and formats properly', () {
      expect(sampleSummary.averageScore, 4.75);
      expect(sampleSummary.periodMark, 5);
      expect(sampleSummary.grades.length, 3);

      final json = sampleSummary.toJson();
      expect(json['subjectName'], 'Алгебра');
      expect(json['averageScore'], 4.75);
      expect(json['periodMark'], 5);

      final fromJson = SubjectGradeSummary.fromJson(json);
      expect(fromJson.subjectName, 'Алгебра');
      expect(fromJson.averageScore, 4.75);
      expect(fromJson.grades.length, 3);
    });

    test('GradeItem JSON serialization works seamlessly', () {
      final grade = sampleGrades[0];
      final json = grade.toJson();
      expect(json['id'], 'g-1');
      expect(json['value'], 5);
      expect(json['weight'], 1.0);

      final restored = GradeItem.fromJson(json);
      expect(restored.id, 'g-1');
      expect(restored.value, 5);
      expect(restored.weight, 1.0);
    });
  });

  group('GPA Simulator Calculation Logic', () {
    test('Simulating additional grades correctly computes projected weighted GPA', () {
      // Current: 5(w1), 4(w1), 5(w2) -> total points = 5 + 4 + 10 = 19, total weight = 4, avg = 4.75
      // Suppose student adds hypothetical 4 (w2, exam):
      // new points = 19 + 8 = 27, new weight = 4 + 2 = 6, new avg = 27 / 6 = 4.50
      final simulator = GpaSimulator(summary: sampleSummary);
      expect(simulator.currentScore, 4.75);

      simulator.addHypotheticalGrade(value: 4, weight: 2.0);
      expect(simulator.simulatedScore, 4.50);
      expect(simulator.willAchieveTarget(5.0), isFalse);
      expect(simulator.willAchieveTarget(4.5), isTrue);

      // Add another 5 (w2)
      // total points = 27 + 10 = 37, total weight = 6 + 2 = 8, new avg = 37 / 8 = 4.625 -> 4.63
      simulator.addHypotheticalGrade(value: 5, weight: 2.0);
      expect(simulator.simulatedScore, 4.63);

      // Reset
      simulator.reset();
      expect(simulator.simulatedScore, 4.75);
      expect(simulator.hypotheticalGrades.isEmpty, isTrue);
    });
  });

  group('GradesNotifier with Offline Hive Cache', () {
    test('Fetches from network and saves to Hive cache', () async {
      final mockService = MockSuccessGradesService([sampleSummary]);
      final notifier = GradesNotifier(mockService, cacheService);

      await notifier.loadGrades(period: '1 триместр');

      expect(notifier.state.hasValue, isTrue);
      expect(notifier.state.value?.length, 1);
      expect(notifier.state.value?[0].subjectName, 'Алгебра');

      // Check Hive cache was populated
      final cached = await cacheService.getCachedGrades('1 триместр');
      expect(cached, isNotNull);
      expect(cached?.length, 1);
      expect(cached?[0].subjectName, 'Алгебра');
    });

    test('Loads from Hive cache when network fails', () async {
      // First save to cache
      await cacheService.saveCachedGrades('1 триместр', [sampleSummary]);

      final mockService = MockFailingGradesService();
      final notifier = GradesNotifier(mockService, cacheService);

      await notifier.loadGrades(period: '1 триместр');

      expect(notifier.state.hasValue, isTrue);
      expect(notifier.state.value?.length, 1);
      expect(notifier.state.value?[0].subjectName, 'Алгебра');
      expect(notifier.isServedFromCache, isTrue);
    });

    test('Populates synthetic data when server returns empty list or has no data', () async {
      final mockEmptyService = MockSuccessGradesService([]);
      final notifier = GradesNotifier(mockEmptyService, cacheService);

      await notifier.loadGrades(period: '1 триместр');

      expect(notifier.state.hasValue, isTrue);
      final summaries = notifier.state.value!;
      expect(summaries.length, greaterThanOrEqualTo(10));
      expect(notifier.overallGpa, greaterThan(4.5));
      expect(summaries.any((s) => s.subjectName == 'Алгебра'), isTrue);
      expect(summaries.any((s) => s.subjectName == 'Геометрия'), isTrue);
      expect(summaries.any((s) => s.subjectName == 'Русский язык'), isTrue);
      expect(summaries.any((s) => s.subjectName == 'Физика'), isTrue);
      expect(summaries.any((s) => s.subjectName == 'Информатика'), isTrue);
    });

    test('Populates synthetic data for other periods as well (2 триместр, 3 триместр, Итог)', () async {
      final mockEmptyService = MockSuccessGradesService([]);
      final notifier = GradesNotifier(mockEmptyService, cacheService);

      for (final period in ['2 триместр', '3 триместр', 'Итог']) {
        await notifier.loadGrades(period: period);
        expect(notifier.state.hasValue, isTrue);
        final summaries = notifier.state.value!;
        expect(summaries.isNotEmpty, isTrue);
        expect(notifier.overallGpa, greaterThan(4.0));
      }
    });
  });
}

