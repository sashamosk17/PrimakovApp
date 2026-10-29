import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/api_models.dart';
import '../../services/api/request_service.dart';
import '../../config/api_config.dart';
import 'package:dio/dio.dart';
import 'auth_provider.dart';

class RequestState {
  final List<SupportRequest> requests;
  final bool isLoading;
  final String? error;

  RequestState({
    this.requests = const [],
    this.isLoading = false,
    this.error,
  });

  RequestState copyWith({
    List<SupportRequest>? requests,
    bool? isLoading,
    String? error,
  }) {
    return RequestState(
      requests: requests ?? this.requests,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class RequestNotifier extends StateNotifier<RequestState> {
  final RequestService _requestService;

  RequestNotifier(this._requestService) : super(RequestState());

  Future<void> fetchUserRequests() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final requests = await _requestService.getUserRequests();
      state = state.copyWith(requests: requests, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }

  Future<void> createRequest({
    required String title,
    required String description,
    required RequestType type,
    RequestPriority priority = RequestPriority.LOW,
    String? roomId,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final request = await _requestService.createRequest(
        title: title,
        description: description,
        type: type,
        priority: priority,
        roomId: roomId,
      );
      state = state.copyWith(
        requests: [...state.requests, request],
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      rethrow;
    }
  }
}

final requestServiceProvider = Provider<RequestService>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: ApiConfig.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));
  
  // Inject token dynamically
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) {
      final token = ref.read(tokenProvider);
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
  ));

  return RequestService(dio);
});

final requestProvider = StateNotifierProvider<RequestNotifier, RequestState>((ref) {
  final service = ref.watch(requestServiceProvider);
  return RequestNotifier(service);
});
