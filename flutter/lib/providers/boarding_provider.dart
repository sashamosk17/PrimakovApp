import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/api_config.dart';
import '../../models/api_models.dart';
import '../services/api/boarding_service.dart';
import 'auth_provider.dart';

class BoardingNotifier extends StateNotifier<AsyncValue<BoardingStatusResponse>> {
  final BoardingService _service;

  BoardingNotifier(this._service) : super(const AsyncValue.loading());

  Future<void> loadStatus() async {
    state = const AsyncValue.loading();
    try {
      final status = await _service.getMyStatus();
      state = AsyncValue.data(status);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> submitCheckIn({String? notes}) async {
    try {
      await _service.checkIn(notes: notes);
      await loadStatus();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> submitLeaveRequest({
    required String departureDate,
    required String returnDate,
    required String transportType,
    bool guardianConfirmed = false,
  }) async {
    try {
      await _service.createLeaveRequest(
        departureDate: departureDate,
        returnDate: returnDate,
        transportType: transportType,
        guardianConfirmed: guardianConfirmed,
      );
      await loadStatus();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final boardingServiceProvider = Provider<BoardingService>((ref) {
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

  return BoardingService(dio);
});

final boardingProvider =
    StateNotifierProvider<BoardingNotifier, AsyncValue<BoardingStatusResponse>>((ref) {
  final service = ref.watch(boardingServiceProvider);
  final notifier = BoardingNotifier(service);
  notifier.loadStatus();
  return notifier;
});

