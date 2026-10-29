import 'package:dio/dio.dart';
import '../../models/api_models.dart';

class RoomService {
  final Dio _dio;

  RoomService(this._dio);

  Future<List<Room>> getAllRooms() async {
    try {
      final response = await _dio.get('/rooms');
      final apiResponse = ApiResponse<List<dynamic>>.fromJson(
        response.data,
        (data) => data as List<dynamic>,
      );

      if (apiResponse.isSuccess && apiResponse.data != null) {
        return apiResponse.data!
            .map((json) => Room.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      throw Exception(apiResponse.error?['message'] ?? 'Failed to load rooms');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error']?['message'] ?? e.message);
    }
  }

  Future<Room> getRoomByNumber(String number) async {
    try {
      final response = await _dio.get('/rooms/$number');
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data,
        (data) => data as Map<String, dynamic>,
      );

      if (apiResponse.isSuccess && apiResponse.data != null) {
        return Room.fromJson(apiResponse.data!);
      }
      throw Exception(apiResponse.error?['message'] ?? 'Failed to load room');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error']?['message'] ?? e.message);
    }
  }

  Future<List<Room>> getRoomsByBuilding(String building) async {
    try {
      final response = await _dio.get('/rooms/building/$building');
      final apiResponse = ApiResponse<List<dynamic>>.fromJson(
        response.data,
        (data) => data as List<dynamic>,
      );

      if (apiResponse.isSuccess && apiResponse.data != null) {
        return apiResponse.data!
            .map((json) => Room.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      throw Exception(apiResponse.error?['message'] ?? 'Failed to load rooms by building');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error']?['message'] ?? e.message);
    }
  }

  Future<List<Room>> getRoomsByFloor(String building, int floor) async {
    try {
      final response = await _dio.get('/rooms/building/$building/floor/$floor');
      final apiResponse = ApiResponse<List<dynamic>>.fromJson(
        response.data,
        (data) => data as List<dynamic>,
      );

      if (apiResponse.isSuccess && apiResponse.data != null) {
        return apiResponse.data!
            .map((json) => Room.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      throw Exception(apiResponse.error?['message'] ?? 'Failed to load rooms by floor');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error']?['message'] ?? e.message);
    }
  }
}
