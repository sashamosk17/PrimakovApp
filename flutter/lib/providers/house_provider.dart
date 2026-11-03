import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/api_config.dart';
import '../../models/api_models.dart';
import '../services/api/house_service.dart';
import 'auth_provider.dart';

class HouseNotifier extends StateNotifier<AsyncValue<HouseCupData>> {
  final HouseService _service;

  HouseNotifier(this._service) : super(const AsyncValue.loading());

  Future<void> loadStandings() async {
    state = const AsyncValue.loading();
    try {
      final data = await _service.getStandings();
      state = AsyncValue.data(data);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> awardPoints({
    required String house,
    required int points,
    required String category,
    required String reason,
    String? studentId,
  }) async {
    try {
      await _service.awardPoints(
        house: house,
        points: points,
        category: category,
        reason: reason,
        studentId: studentId,
      );
      await loadStandings();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final houseServiceProvider = Provider<HouseService>((ref) {
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

  return HouseService(dio);
});

final houseProvider =
    StateNotifierProvider<HouseNotifier, AsyncValue<HouseCupData>>((ref) {
  final service = ref.watch(houseServiceProvider);
  final notifier = HouseNotifier(service);
  notifier.loadStandings();
  return notifier;
});

