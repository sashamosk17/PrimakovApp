import 'package:dio/dio.dart';
import '../../models/api_models.dart';

class RequestService {
  final Dio _dio;

  RequestService(this._dio);

  Future<SupportRequest> createRequest({
    required String title,
    required String description,
    required RequestType type,
    RequestPriority priority = RequestPriority.LOW,
    String? roomId,
  }) async {
    try {
      final response = await _dio.post('/requests', data: {
        'title': title,
        'description': description,
        'type': type.name,
        'priority': priority.name,
        if (roomId != null) 'roomId': roomId,
      });

      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        response.data,
        (data) => data as Map<String, dynamic>,
      );

      if (apiResponse.isSuccess && apiResponse.data != null) {
        return SupportRequest.fromJson(apiResponse.data!);
      }
      throw Exception(apiResponse.error?['message'] ?? 'Failed to create request');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error']?['message'] ?? e.message);
    }
  }

  Future<List<SupportRequest>> getUserRequests() async {
    try {
      final response = await _dio.get('/requests');
      final apiResponse = ApiResponse<List<dynamic>>.fromJson(
        response.data,
        (data) => data as List<dynamic>,
      );

      if (apiResponse.isSuccess && apiResponse.data != null) {
        return apiResponse.data!
            .map((json) => SupportRequest.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      throw Exception(apiResponse.error?['message'] ?? 'Failed to load user requests');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error']?['message'] ?? e.message);
    }
  }

  Future<List<SupportRequest>> getAssignedRequests() async {
    try {
      final response = await _dio.get('/requests/assigned');
      final apiResponse = ApiResponse<List<dynamic>>.fromJson(
        response.data,
        (data) => data as List<dynamic>,
      );

      if (apiResponse.isSuccess && apiResponse.data != null) {
        return apiResponse.data!
            .map((json) => SupportRequest.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      throw Exception(apiResponse.error?['message'] ?? 'Failed to load assigned requests');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error']?['message'] ?? e.message);
    }
  }

  Future<void> updateRequestStatus(String requestId, RequestStatus status, {String? notes}) async {
    try {
      final response = await _dio.patch('/requests/$requestId/status', data: {
        'status': status.name,
        if (notes != null) 'notes': notes,
      });

      final apiResponse = ApiResponse<dynamic>.fromJson(
        response.data,
        (data) => data,
      );

      if (apiResponse.isError) {
        throw Exception(apiResponse.error?['message'] ?? 'Failed to update request status');
      }
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error']?['message'] ?? e.message);
    }
  }

  Future<List<SupportRequest>> getActiveRequests() async {
    try {
      final response = await _dio.get('/requests/active');
      final apiResponse = ApiResponse<List<dynamic>>.fromJson(
        response.data,
        (data) => data as List<dynamic>,
      );

      if (apiResponse.isSuccess && apiResponse.data != null) {
        return apiResponse.data!
            .map((json) => SupportRequest.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      throw Exception(apiResponse.error?['message'] ?? 'Failed to load active requests');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error']?['message'] ?? e.message);
    }
  }
}
