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
      state = AsyncValue.data(fresh);

      // Save fresh data to cache
      if (_cacheService != null) {
        await _cacheService!.saveCachedGrades(targetPeriod, fresh);
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
        state = AsyncValue.error(e, st);
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

