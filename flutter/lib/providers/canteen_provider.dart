import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/api_models.dart';
import '../../services/api/canteen_service.dart';
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

  CanteenNotifier(this._canteenService) : super(CanteenState());

  Future<void> fetchTodayMenu() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      print('🍽️ [CanteenProvider] Fetching today menu...');
      final menus = await _canteenService.getTodaysMenuList();
      print('🍽️ [CanteenProvider] Received ${menus.length} menus');
      for (var menu in menus) {
        print('🍽️ [CanteenProvider] Menu: ${menu.mealType}, items: ${menu.items.length}');
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
  return CanteenNotifier(service);
});
