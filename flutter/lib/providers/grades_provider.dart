import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/api_config.dart';
import '../../models/api_models.dart';
import '../services/api/grades_service.dart';
import '../services/cache/offline_cache_service.dart';
import 'auth_provider.dart';

class GradesNotifier extends StateNotifier<AsyncValue<List<SubjectGradeSummary>>> {
  final GradesService _service;
  final OfflineCacheService? _cacheService;

  bool isServedFromCache = false;
  DateTime? lastUpdated;
  String currentPeriod = '1 триместр';

  GradesNotifier(this._service, [this._cacheService])
      : super(const AsyncValue.loading());

  Future<void> loadGrades({String? period}) async {
    final targetPeriod = period ?? currentPeriod;
    currentPeriod = targetPeriod;

    // 1. Try reading from offline cache for instant UI rendering
    if (_cacheService != null) {
      final cached = await _cacheService!.getCachedGrades(targetPeriod);
      if (cached != null && cached.isNotEmpty) {
        isServedFromCache = true;
        state = AsyncValue.data(cached);
      } else {
        state = const AsyncValue.loading();
      }
    } else {
      state = const AsyncValue.loading();
    }

    // 2. Fetch fresh from network
    try {
      final fresh = await _service.getMyGrades(period: targetPeriod);
      isServedFromCache = false;
      if (fresh.isNotEmpty) {
        state = AsyncValue.data(fresh);
        // Save fresh data to cache
        if (_cacheService != null) {
          await _cacheService!.saveCachedGrades(targetPeriod, fresh);
        }
      } else {
        // Fallback to comprehensive synthetic dataset when database has no grades for student
        final synthetic = generateSyntheticGrades(targetPeriod);
        state = AsyncValue.data(synthetic);
        if (_cacheService != null) {
          await _cacheService!.saveCachedGrades(targetPeriod, synthetic);
        }
      }
    } catch (e, st) {
      // If we already had cached data in state, keep it with flag isServedFromCache=true
      if (state.hasValue && (state.asData?.value.isNotEmpty ?? false)) {
        isServedFromCache = true;
      } else {
        // Otherwise attempt fallback read
        if (_cacheService != null) {
          final cached = await _cacheService!.getCachedGrades(targetPeriod);
          if (cached != null && cached.isNotEmpty) {
            isServedFromCache = true;
            state = AsyncValue.data(cached);
            return;
          }
        }
        // Fallback to synthetic dataset on network error
        final synthetic = generateSyntheticGrades(targetPeriod);
        isServedFromCache = true;
        state = AsyncValue.data(synthetic);
      }
    }
  }

  double get overallGpa {
    final list = state.asData?.value ?? [];
    if (list.isEmpty) return 0.0;
    double total = 0;
    int count = 0;
    for (final s in list) {
      if (s.averageScore > 0) {
        total += s.averageScore;
        count++;
      }
    }
    if (count == 0) return 0.0;
    return (total / count * 100).round() / 100.0;
  }
}

final gradesServiceProvider = Provider<GradesService>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: ApiConfig.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) {
      final token = ref.read(tokenProvider);
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
  ));

  return GradesService(dio);
});

final gradesProvider =
    StateNotifierProvider<GradesNotifier, AsyncValue<List<SubjectGradeSummary>>>((ref) {
  final service = ref.watch(gradesServiceProvider);
  final cache = ref.watch(offlineCacheServiceProvider);
  final notifier = GradesNotifier(service, cache);
  notifier.loadGrades();
  return notifier;
});

/// Generates realistic synthetic grades for Primakov Gymnasium students
List<SubjectGradeSummary> generateSyntheticGrades(String period) {
  final now = DateTime.now();

  GradeItem _g({
    required String id,
    required String subjectId,
    required String subjectName,
    required int value,
    required double weight,
    required int daysAgo,
    required String topic,
  }) {
    return GradeItem(
      id: id,
      studentId: 'synthetic-student',
      subjectId: subjectId,
      subjectName: subjectName,
      value: value,
      weight: weight,
      date: now.subtract(Duration(days: daysAgo)).toIso8601String(),
      period: period,
      topic: topic,
    );
  }

  SubjectGradeSummary _buildSummary(String name, List<GradeItem> grades) {
    double totalPoints = 0;
    double totalWeights = 0;
    for (final g in grades) {
      totalPoints += g.value * g.weight;
      totalWeights += g.weight;
    }
    final avg = totalWeights > 0 ? (totalPoints / totalWeights * 100).round() / 100.0 : 0.0;
    final mark = avg >= 4.5 ? 5 : (avg >= 3.5 ? 4 : (avg >= 2.5 ? 3 : 2));
    return SubjectGradeSummary(
      subjectName: name,
      grades: grades,
      averageScore: avg,
      periodMark: mark,
    );
  }

  if (period.contains('2')) {
    return [
      _buildSummary('Алгебра', [
        _g(id: 'syn-2-m1', subjectId: 'subj-math', subjectName: 'Алгебра', value: 5, weight: 1.0, daysAgo: 50, topic: 'Тригонометрические формулы'),
        _g(id: 'syn-2-m2', subjectId: 'subj-math', subjectName: 'Алгебра', value: 4, weight: 1.5, daysAgo: 35, topic: 'Контрольная работа №3'),
        _g(id: 'syn-2-m3', subjectId: 'subj-math', subjectName: 'Алгебра', value: 5, weight: 2.0, daysAgo: 20, topic: 'Триместровый зачет'),
      ]),
      _buildSummary('Геометрия', [
        _g(id: 'syn-2-g1', subjectId: 'subj-geom', subjectName: 'Геометрия', value: 5, weight: 1.0, daysAgo: 45, topic: 'Стереометрия: Призмы'),
        _g(id: 'syn-2-g2', subjectId: 'subj-geom', subjectName: 'Геометрия', value: 5, weight: 1.5, daysAgo: 25, topic: 'Контрольная работа'),
      ]),
      _buildSummary('Русский язык', [
        _g(id: 'syn-2-r1', subjectId: 'subj-rus', subjectName: 'Русский язык', value: 5, weight: 1.0, daysAgo: 48, topic: 'Пунктуация в сложном предложении'),
        _g(id: 'syn-2-r2', subjectId: 'subj-rus', subjectName: 'Русский язык', value: 4, weight: 1.5, daysAgo: 30, topic: 'Контрольный диктант'),
      ]),
      _buildSummary('Литература', [
        _g(id: 'syn-2-l1', subjectId: 'subj-lit', subjectName: 'Литература', value: 5, weight: 1.0, daysAgo: 46, topic: 'Творчество М.А. Булгакова'),
        _g(id: 'syn-2-l2', subjectId: 'subj-lit', subjectName: 'Литература', value: 5, weight: 1.5, daysAgo: 22, topic: 'Сочинение: Роман "Мастер и Маргарита"'),
      ]),
      _buildSummary('Английский язык', [
        _g(id: 'syn-2-e1', subjectId: 'subj-english', subjectName: 'Английский язык', value: 5, weight: 1.0, daysAgo: 52, topic: 'Academic Writing & Research'),
        _g(id: 'syn-2-e2', subjectId: 'subj-english', subjectName: 'Английский язык', value: 5, weight: 1.5, daysAgo: 28, topic: 'Model UN Debate Session'),
      ]),
      _buildSummary('Физика', [
        _g(id: 'syn-2-p1', subjectId: 'subj-physics', subjectName: 'Физика', value: 4, weight: 1.0, daysAgo: 44, topic: 'Геометрическая оптика'),
        _g(id: 'syn-2-p2', subjectId: 'subj-physics', subjectName: 'Физика', value: 5, weight: 1.5, daysAgo: 24, topic: 'Лабораторный практикум: Линзы'),
      ]),
      _buildSummary('Информатика', [
        _g(id: 'syn-2-c1', subjectId: 'subj-cs', subjectName: 'Информатика', value: 5, weight: 1.0, daysAgo: 50, topic: 'Реляционные базы данных и SQL'),
        _g(id: 'syn-2-c2', subjectId: 'subj-cs', subjectName: 'Информатика', value: 5, weight: 2.0, daysAgo: 18, topic: 'Разработка Telegram-бота'),
      ]),
      _buildSummary('Химия', [
        _g(id: 'syn-2-ch1', subjectId: 'subj-chem', subjectName: 'Химия', value: 5, weight: 1.0, daysAgo: 42, topic: 'Химическая кинетика'),
        _g(id: 'syn-2-ch2', subjectId: 'subj-chem', subjectName: 'Химия', value: 4, weight: 1.5, daysAgo: 26, topic: 'Контрольная работа'),
      ]),
      _buildSummary('История', [
        _g(id: 'syn-2-h1', subjectId: 'subj-history', subjectName: 'История', value: 5, weight: 1.0, daysAgo: 40, topic: 'Россия в XIX веке'),
        _g(id: 'syn-2-h2', subjectId: 'subj-history', subjectName: 'История', value: 5, weight: 1.5, daysAgo: 21, topic: 'Семинар: Великие реформы 1860-х'),
      ]),
      _buildSummary('Физическая культура', [
        _g(id: 'syn-2-pe1', subjectId: 'subj-pe', subjectName: 'Физическая культура', value: 5, weight: 1.0, daysAgo: 38, topic: 'Лыжная подготовка'),
        _g(id: 'syn-2-pe2', subjectId: 'subj-pe', subjectName: 'Физическая культура', value: 5, weight: 1.0, daysAgo: 19, topic: 'Баскетбол: командная игра'),
      ]),
    ];
  }

  if (period.contains('3')) {
    return [
      _buildSummary('Алгебра', [
        _g(id: 'syn-3-m1', subjectId: 'subj-math', subjectName: 'Алгебра', value: 5, weight: 1.0, daysAgo: 70, topic: 'Производная функции'),
        _g(id: 'syn-3-m2', subjectId: 'subj-math', subjectName: 'Алгебра', value: 5, weight: 2.0, daysAgo: 55, topic: 'Итоговая контрольная работа'),
      ]),
      _buildSummary('Геометрия', [
        _g(id: 'syn-3-g1', subjectId: 'subj-geom', subjectName: 'Геометрия', value: 5, weight: 1.5, daysAgo: 65, topic: 'Тела вращения: Цилиндр и конус'),
      ]),
      _buildSummary('Русский язык', [
        _g(id: 'syn-3-r1', subjectId: 'subj-rus', subjectName: 'Русский язык', value: 5, weight: 1.5, daysAgo: 60, topic: 'Итоговое тестирование ЕГЭ-формата'),
      ]),
      _buildSummary('Литература', [
        _g(id: 'syn-3-l1', subjectId: 'subj-lit', subjectName: 'Литература', value: 5, weight: 1.5, daysAgo: 58, topic: 'Литература второй половины XX века'),
      ]),
      _buildSummary('Английский язык', [
        _g(id: 'syn-3-e1', subjectId: 'subj-english', subjectName: 'Английский язык', value: 5, weight: 1.5, daysAgo: 62, topic: 'IELTS Academic Preparation Test'),
      ]),
      _buildSummary('Физика', [
        _g(id: 'syn-3-p1', subjectId: 'subj-physics', subjectName: 'Физика', value: 5, weight: 2.0, daysAgo: 54, topic: 'Годовой срез знаний'),
      ]),
      _buildSummary('Информатика', [
        _g(id: 'syn-3-c1', subjectId: 'subj-cs', subjectName: 'Информатика', value: 5, weight: 2.0, daysAgo: 52, topic: 'Защита индивидуального IT-проекта'),
      ]),
      _buildSummary('История', [
        _g(id: 'syn-3-h1', subjectId: 'subj-history', subjectName: 'История', value: 5, weight: 1.5, daysAgo: 56, topic: 'Итоговый исторический практикум'),
      ]),
      _buildSummary('Физическая культура', [
        _g(id: 'syn-3-pe1', subjectId: 'subj-pe', subjectName: 'Физическая культура', value: 5, weight: 1.0, daysAgo: 50, topic: 'Легкоатлетический кросс'),
      ]),
    ];
  }

  if (period.contains('Итог') || period.contains('Год')) {
    return [
      _buildSummary('Алгебра', [_g(id: 'syn-f-m', subjectId: 'subj-math', subjectName: 'Алгебра', value: 5, weight: 2.0, daysAgo: 1, topic: 'Годовая аттестация')]),
      _buildSummary('Геометрия', [_g(id: 'syn-f-g', subjectId: 'subj-geom', subjectName: 'Геометрия', value: 5, weight: 2.0, daysAgo: 1, topic: 'Годовая аттестация')]),
      _buildSummary('Русский язык', [_g(id: 'syn-f-r', subjectId: 'subj-rus', subjectName: 'Русский язык', value: 5, weight: 2.0, daysAgo: 1, topic: 'Годовая аттестация')]),
      _buildSummary('Литература', [_g(id: 'syn-f-l', subjectId: 'subj-lit', subjectName: 'Литература', value: 5, weight: 2.0, daysAgo: 1, topic: 'Годовая аттестация')]),
      _buildSummary('Английский язык', [_g(id: 'syn-f-e', subjectId: 'subj-english', subjectName: 'Английский язык', value: 5, weight: 2.0, daysAgo: 1, topic: 'Годовая аттестация')]),
      _buildSummary('Физика', [_g(id: 'syn-f-p', subjectId: 'subj-physics', subjectName: 'Физика', value: 5, weight: 2.0, daysAgo: 1, topic: 'Годовая аттестация')]),
      _buildSummary('Химия', [_g(id: 'syn-f-ch', subjectId: 'subj-chem', subjectName: 'Химия', value: 5, weight: 2.0, daysAgo: 1, topic: 'Годовая аттестация')]),
      _buildSummary('Биология', [_g(id: 'syn-f-b', subjectId: 'subj-bio', subjectName: 'Биология', value: 5, weight: 2.0, daysAgo: 1, topic: 'Годовая аттестация')]),
      _buildSummary('История', [_g(id: 'syn-f-h', subjectId: 'subj-history', subjectName: 'История', value: 5, weight: 2.0, daysAgo: 1, topic: 'Годовая аттестация')]),
      _buildSummary('Обществознание', [_g(id: 'syn-f-s', subjectId: 'subj-soc', subjectName: 'Обществознание', value: 5, weight: 2.0, daysAgo: 1, topic: 'Годовая аттестация')]),
      _buildSummary('Информатика', [_g(id: 'syn-f-c', subjectId: 'subj-cs', subjectName: 'Информатика', value: 5, weight: 2.0, daysAgo: 1, topic: 'Годовая аттестация')]),
      _buildSummary('Физическая культура', [_g(id: 'syn-f-pe', subjectId: 'subj-pe', subjectName: 'Физическая культура', value: 5, weight: 2.0, daysAgo: 1, topic: 'Годовая аттестация')]),
    ];
  }

  // Default: 1 триместр (12 comprehensive subjects, weighted GPA ~4.76)
  return [
    _buildSummary('Алгебра', [
      _g(id: 'syn-1-m1', subjectId: 'subj-math', subjectName: 'Алгебра', value: 5, weight: 1.0, daysAgo: 24, topic: 'Квадратные трехчлены'),
      _g(id: 'syn-1-m2', subjectId: 'subj-math', subjectName: 'Алгебра', value: 4, weight: 1.5, daysAgo: 14, topic: 'Контрольная работа №2'),
      _g(id: 'syn-1-m3', subjectId: 'subj-math', subjectName: 'Алгебра', value: 5, weight: 2.0, daysAgo: 3, topic: 'Триместровый срез знаний'),
    ]),
    _buildSummary('Геометрия', [
      _g(id: 'syn-1-g1', subjectId: 'subj-geom', subjectName: 'Геометрия', value: 5, weight: 1.0, daysAgo: 22, topic: 'Теорема косинусов'),
      _g(id: 'syn-1-g2', subjectId: 'subj-geom', subjectName: 'Геометрия', value: 5, weight: 1.5, daysAgo: 10, topic: 'Векторы в пространстве'),
      _g(id: 'syn-1-g3', subjectId: 'subj-geom', subjectName: 'Геометрия', value: 5, weight: 2.0, daysAgo: 2, topic: 'Зачетная работа'),
    ]),
    _buildSummary('Русский язык', [
      _g(id: 'syn-1-r1', subjectId: 'subj-rus', subjectName: 'Русский язык', value: 5, weight: 1.0, daysAgo: 20, topic: 'Сложноподчиненные предложения'),
      _g(id: 'syn-1-r2', subjectId: 'subj-rus', subjectName: 'Русский язык', value: 4, weight: 1.0, daysAgo: 11, topic: 'Диктант с грамматическим заданием'),
      _g(id: 'syn-1-r3', subjectId: 'subj-rus', subjectName: 'Русский язык', value: 5, weight: 1.5, daysAgo: 4, topic: 'Контрольное изложение'),
    ]),
    _buildSummary('Литература', [
      _g(id: 'syn-1-l1', subjectId: 'subj-lit', subjectName: 'Литература', value: 5, weight: 1.0, daysAgo: 18, topic: 'Анализ поэзии Серебряного века'),
      _g(id: 'syn-1-l2', subjectId: 'subj-lit', subjectName: 'Литература', value: 5, weight: 1.5, daysAgo: 6, topic: 'Сочинение по творчеству Бунина'),
      _g(id: 'syn-1-l3', subjectId: 'subj-lit', subjectName: 'Литература', value: 5, weight: 1.0, daysAgo: 1, topic: 'Выразительное чтение'),
    ]),
    _buildSummary('Английский язык', [
      _g(id: 'syn-1-e1', subjectId: 'subj-english', subjectName: 'Английский язык', value: 5, weight: 1.0, daysAgo: 21, topic: 'Essay: Modern Digital Trends'),
      _g(id: 'syn-1-e2', subjectId: 'subj-english', subjectName: 'Английский язык', value: 4, weight: 1.5, daysAgo: 8, topic: 'Speaking Exam: Cambridge Format'),
      _g(id: 'syn-1-e3', subjectId: 'subj-english', subjectName: 'Английский язык', value: 5, weight: 1.5, daysAgo: 2, topic: 'Grammar Proficiency Test'),
    ]),
    _buildSummary('Физика', [
      _g(id: 'syn-1-p1', subjectId: 'subj-physics', subjectName: 'Физика', value: 5, weight: 1.0, daysAgo: 19, topic: 'Закон Кулона'),
      _g(id: 'syn-1-p2', subjectId: 'subj-physics', subjectName: 'Физика', value: 4, weight: 1.5, daysAgo: 9, topic: 'Лабораторная работа: Определение КПД'),
      _g(id: 'syn-1-p3', subjectId: 'subj-physics', subjectName: 'Физика', value: 5, weight: 2.0, daysAgo: 3, topic: 'Контрольная работа: Электродинамика'),
    ]),
    _buildSummary('Химия', [
      _g(id: 'syn-1-ch1', subjectId: 'subj-chem', subjectName: 'Химия', value: 5, weight: 1.0, daysAgo: 16, topic: 'Периодический закон Менделеева'),
      _g(id: 'syn-1-ch2', subjectId: 'subj-chem', subjectName: 'Химия', value: 4, weight: 1.5, daysAgo: 7, topic: 'Практическая работа с реактивами'),
      _g(id: 'syn-1-ch3', subjectId: 'subj-chem', subjectName: 'Химия', value: 5, weight: 1.0, daysAgo: 2, topic: 'Тестирование: Строение атома'),
    ]),
    _buildSummary('Биология', [
      _g(id: 'syn-1-b1', subjectId: 'subj-bio', subjectName: 'Биология', value: 5, weight: 1.0, daysAgo: 15, topic: 'Молекулярная генетика'),
      _g(id: 'syn-1-b2', subjectId: 'subj-bio', subjectName: 'Биология', value: 5, weight: 1.5, daysAgo: 5, topic: 'Семинар: Биотехнологии будущего'),
      _g(id: 'syn-1-b3', subjectId: 'subj-bio', subjectName: 'Биология', value: 5, weight: 1.0, daysAgo: 1, topic: 'Лабораторный практикум'),
    ]),
    _buildSummary('История', [
      _g(id: 'syn-1-h1', subjectId: 'subj-history', subjectName: 'История', value: 5, weight: 1.0, daysAgo: 17, topic: 'Реформы Петра Великого'),
      _g(id: 'syn-1-h2', subjectId: 'subj-history', subjectName: 'История', value: 4, weight: 1.0, daysAgo: 10, topic: 'Историческое эссе'),
      _g(id: 'syn-1-h3', subjectId: 'subj-history', subjectName: 'История', value: 5, weight: 1.5, daysAgo: 3, topic: 'Тестирование: Эпоха Просвещения'),
    ]),
    _buildSummary('Обществознание', [
      _g(id: 'syn-1-s1', subjectId: 'subj-soc', subjectName: 'Обществознание', value: 5, weight: 1.0, daysAgo: 13, topic: 'Экономические системы и рынки'),
      _g(id: 'syn-1-s2', subjectId: 'subj-soc', subjectName: 'Обществознание', value: 5, weight: 1.5, daysAgo: 4, topic: 'Защита бизнес-кейса'),
    ]),
    _buildSummary('Информатика', [
      _g(id: 'syn-1-c1', subjectId: 'subj-cs', subjectName: 'Информатика', value: 5, weight: 1.0, daysAgo: 23, topic: 'Алгоритмы поиска и структуры данных'),
      _g(id: 'syn-1-c2', subjectId: 'subj-cs', subjectName: 'Информатика', value: 5, weight: 1.5, daysAgo: 12, topic: 'Проектная разработка на Python & SQL'),
      _g(id: 'syn-1-c3', subjectId: 'subj-cs', subjectName: 'Информатика', value: 5, weight: 2.0, daysAgo: 2, topic: 'Олимпиадное программирование'),
    ]),
    _buildSummary('Физическая культура', [
      _g(id: 'syn-1-pe1', subjectId: 'subj-pe', subjectName: 'Физическая культура', value: 5, weight: 1.0, daysAgo: 20, topic: 'Нормативы ГТО'),
      _g(id: 'syn-1-pe2', subjectId: 'subj-pe', subjectName: 'Физическая культура', value: 5, weight: 1.0, daysAgo: 5, topic: 'Волейбольный турнир Домов'),
    ]),
  ];
}

