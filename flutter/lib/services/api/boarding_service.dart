import 'package:dio/dio.dart';
import '../../models/api_models.dart';

class BoardingService {
  final Dio? _dio;

  BoardingService([this._dio]);

  String _extractErrorMessage(DioException e, String fallback) {
    final resData = e.response?.data;
    if (resData is Map) {
      final err = resData['error'];
      if (err is Map) {
        return err['message']?.toString() ?? fallback;
      } else if (err is String) {
        return err;
      } else if (resData['message'] is String) {
        return resData['message'] as String;
      }
    }
    return e.message ?? fallback;
  }

  Future<BoardingStatusResponse> getMyStatus() async {
    if (_dio == null) {
      throw Exception('Dio client not configured');
    }

    try {
      final response = await _dio!.get('/boarding/my-status');
      final data = response.data;
      if (data is Map<String, dynamic> && data['status'] == 'success') {
        return BoardingStatusResponse.fromJson(data['data'] as Map<String, dynamic>);
      }
      throw Exception('Failed to get boarding status');
    } on DioException catch (e) {
      throw Exception(_extractErrorMessage(e, 'Ошибка загрузки статуса пансиона'));
    }
  }

  Future<BoardingCheckInItem> checkIn({
    String? notes,
    double? latitude,
    double? longitude,
  }) async {
    if (_dio == null) {
      throw Exception('Dio client not configured');
    }

    try {
      final response = await _dio!.post('/boarding/check-in', data: {
        'notes': notes,
        'latitude': latitude,
        'longitude': longitude,
      });

      final data = response.data;
      if (data is Map<String, dynamic> && data['status'] == 'success') {
        return BoardingCheckInItem.fromJson(data['data'] as Map<String, dynamic>);
      }
      throw Exception('Check-in failed');
    } on DioException catch (e) {
      throw Exception(_extractErrorMessage(e, 'Ошибка вечернего чекина'));
    }
  }

  Future<WeekendLeaveRequestItem> createLeaveRequest({
    required String departureDate,
    required String returnDate,
    required String transportType,
    bool guardianConfirmed = false,
  }) async {
    if (_dio == null) {
      throw Exception('Dio client not configured');
    }

    try {
      final response = await _dio!.post('/boarding/leave-request', data: {
        'departureDate': departureDate,
        'returnDate': returnDate,
        'transportType': transportType,
        'guardianConfirmed': guardianConfirmed,
      });

      final data = response.data;
      if (data is Map<String, dynamic> && data['status'] == 'success') {
        return WeekendLeaveRequestItem.fromJson(data['data'] as Map<String, dynamic>);
      }
      throw Exception('Failed to create leave request');
    } on DioException catch (e) {
      throw Exception(_extractErrorMessage(e, 'Ошибка оформления выезда'));
    }
  }
}

