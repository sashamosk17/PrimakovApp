import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/api_models.dart';
import '../../services/api/room_service.dart';
import '../../config/api_config.dart';
import 'package:dio/dio.dart';
import 'auth_provider.dart';

class RoomState {
  final List<Room> rooms;
  final bool isLoading;
  final String? error;
  final Room? selectedRoom;

  RoomState({
    this.rooms = const [],
    this.isLoading = false,
    this.error,
    this.selectedRoom,
  });

  RoomState copyWith({
    List<Room>? rooms,
    bool? isLoading,
    String? error,
    Room? selectedRoom,
  }) {
    return RoomState(
      rooms: rooms ?? this.rooms,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      selectedRoom: selectedRoom ?? this.selectedRoom,
    );
  }
}

class RoomNotifier extends StateNotifier<RoomState> {
  final RoomService _roomService;

  RoomNotifier(this._roomService) : super(RoomState());

  Future<void> fetchRooms() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final rooms = await _roomService.getAllRooms();
      state = state.copyWith(rooms: rooms, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }

  Future<void> fetchRoomByNumber(String number) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final room = await _roomService.getRoomByNumber(number);
      state = state.copyWith(selectedRoom: room, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }
}

final roomServiceProvider = Provider<RoomService>((ref) {
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

  return RoomService(dio);
});

final roomProvider = StateNotifierProvider<RoomNotifier, RoomState>((ref) {
  final service = ref.watch(roomServiceProvider);
  return RoomNotifier(service);
});
