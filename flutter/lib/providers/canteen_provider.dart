import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/api_models.dart';
import '../../services/api/canteen_service.dart';
import '../../services/cache/offline_cache_service.dart';
import '../../config/api_config.dart';
import 'package:dio/dio.dart';
import 'auth_provider.dart';

class CanteenState {
  final List<CanteenMenu>? todayMenu;
  final bool isLoading;
  final String? error;

  CanteenState({
    this.todayMenu,
    this.isLoading = false,
    this.error,
  });

  CanteenState copyWith({
    List<CanteenMenu>? todayMenu,
    bool? isLoading,
    String? error,
  }) {
    return CanteenState(
      todayMenu: todayMenu ?? this.todayMenu,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class CanteenNotifier extends StateNotifier<CanteenState> {
  final CanteenService _canteenService;
  final OfflineCacheService? _cacheService;

  CanteenNotifier(this._canteenService, {OfflineCacheService? cacheService})
      : _cacheService = cacheService,
        super(CanteenState());

  Future<void> fetchTodayMenu() async {
    // Check offline cache first for instant UX
    if (_cacheService != null) {
      final cached = await _cacheService!.getTodaysMenu();
      if (cached != null) {
        state = state.copyWith(todayMenu: cached, isLoading: true, error: null);
      } else {
        state = state.copyWith(isLoading: true, error: null);
      }
    } else {
      state = state.copyWith(isLoading: true, error: null);
    }

    try {
      print('🍽️ [CanteenProvider] Fetching today menu...');
      final menus = await _canteenService.getTodaysMenuList();
      print('🍽️ [CanteenProvider] Received ${menus.length} menus');

      if (_cacheService != null) {
        await _cacheService!.saveTodaysMenu(menus);
      }

      state = CanteenState(todayMenu: menus, isLoading: false, error: null);
    } catch (e) {
      print('❌ [CanteenProvider] Error: $e');
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }
}

final canteenServiceProvider = Provider<CanteenService>((ref) {
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

  return CanteenService(dio);
});

final canteenProvider = StateNotifierProvider<CanteenNotifier, CanteenState>((ref) {
  final service = ref.watch(canteenServiceProvider);
  final cacheService = ref.watch(offlineCacheServiceProvider);
  return CanteenNotifier(service, cacheService: cacheService);
});
