import 'package:dio/dio.dart';
import '../../models/api_models.dart';
import '../../config/api_config.dart';

class StoryService {
  late final Dio _dio;

  StoryService() {
    _dio = ApiConfig.createDio();
  }

  Future<List<Story>> getAllStories() async {
    try {
      print('🔄 Getting stories');
      
      final response = await _dio.get('/stories');

      print('✅ Stories response status: ${response.statusCode}');
      print('📦 Stories response data: ${response.data}');

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
        final stories = dataField
            .map((e) => Story.fromJson(e as Map<String, dynamic>))
            .toList();
        print('✅ Loaded ${stories.length} stories');
        return stories;
      } else {
        print('⚠️ Data field is not a list: ${dataField.runtimeType}');
        return [];
      }
      
    } on DioException catch (e) {
      print('❌ Stories error: ${e.message}');
      throw Exception('Stories service error: ${e.message}');
    }
  }

  Future<void> markStoryAsViewed(String storyId) async {
    try {
      print('🔄 Marking story as viewed: $storyId');

      final response = await _dio.post('/stories/$storyId/view');

      print('✅ Mark viewed response status: ${response.statusCode}');
      print('📦 Mark viewed response data: ${response.data}');

      // Сервер может не возвращать data, это нормально
      if (response.statusCode == 200) {
        print('✅ Story marked as viewed');
      }

    } on DioException catch (e) {
      print('❌ Mark viewed error: ${e.message}');
      throw Exception('Mark story viewed error: ${e.message}');
    }
  }
}