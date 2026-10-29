import 'package:dio/dio.dart';
import '../../models/api_models.dart';
import '../../config/api_config.dart';

class DeadlineService {
  final Dio _dio = ApiConfig.createDio();

  Future<List<Deadline>> getDeadlines(String userId, {String? status}) async {
    try {
      print('🔄 Getting deadlines for user: $userId');
      
      final queryParams = {'userId': userId};
      if (status != null) {
        queryParams['status'] = status;
      }

      final response = await _dio.get(
        '/deadlines',
        queryParameters: queryParams,
      );

      print('✅ Response status: ${response.statusCode}');
      print('📦 Response data: ${response.data}');

      if (response.data == null) {
        print('⚠️ Response data is null');
        return [];
      }

      final responseData = response.data as Map<String, dynamic>;
      
      if (responseData['status'] == 'error') {
        throw Exception(responseData['error']?['message'] ?? 'Server error');
      }

      final dataField = responseData['data'];
      if (dataField == null) {
        print('⚠️ Data field is null');
        return [];
      }

      if (dataField is List) {
        final deadlines = dataField
            .map((e) => Deadline.fromJson(e as Map<String, dynamic>))
            .toList();
        print('✅ Loaded ${deadlines.length} deadlines');
        return deadlines;
      } else {
        print('⚠️ Data field is not a list: ${dataField.runtimeType}');
        return [];
      }
      
    } on DioException catch (e) {
      print('❌ Dio error: ${e.message}');
      if (e.response?.statusCode == 404) {
        print('⚠️ API endpoint not found! Check baseUrl');
      }
      throw Exception('Deadlines service error: ${e.message}');
    } catch (e) {
      print('❌ Unexpected error: $e');
      throw Exception('Unexpected error: $e');
    }
  }

  Future<Deadline> createDeadline(Deadline deadline) async {
    try {
      print('🔄 Creating deadline: ${deadline.title}');
      
      final payload = {
        'title': deadline.title,
        if (deadline.description.isNotEmpty) 'description': deadline.description,
        'dueDate': deadline.dueDate,
        if (deadline.subject != null && deadline.subject!.isNotEmpty) 'subject': deadline.subject,
      };

      final response = await _dio.post(
        '/deadlines',
        data: payload,
      );

      print('✅ Create response: ${response.statusCode}');

      if (response.data == null) {
        throw Exception('Server returned empty response');
      }

      final responseData = response.data as Map<String, dynamic>;
      
      if (responseData['status'] == 'error') {
        throw Exception(responseData['error']?['message'] ?? 'Failed to create');
      }

      final dataField = responseData['data'];
      if (dataField == null) {
        throw Exception('Server returned null data');
      }

      return Deadline.fromJson(dataField as Map<String, dynamic>);
      
    } on DioException catch (e) {
      print('❌ Create error: ${e.message}');
      final msg = e.response?.data is Map
          ? (e.response!.data['error']?['message'] ?? e.response!.data['message'] ?? e.message)
          : e.message;
      throw Exception(msg ?? 'Create deadline error');
    }
  }

  Future<void> completeDeadline(String deadlineId) async {
    try {
      print('🔄 Completing deadline: $deadlineId');
      
      final response = await _dio.patch(
        '/deadlines/$deadlineId/complete',
      );

      print('✅ Complete response: ${response.statusCode}');
      print('📦 Complete response data: ${response.data}');

      if (response.data == null) {
        print('⚠️ Response data is null, but status 200 means success');
        return;
      }

      final responseData = response.data as Map<String, dynamic>;
      
      if (responseData['status'] == 'error') {
        throw Exception(responseData['error']?['message'] ?? 'Failed to complete');
      }

      print('✅ Deadline completed successfully');
      return;
      
    } on DioException catch (e) {
      print('❌ Complete error: ${e.message}');
      throw Exception('Complete deadline error: ${e.message}');
    }
  }
}