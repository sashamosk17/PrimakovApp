import 'package:dio/dio.dart';
import '../../models/api_models.dart';
import '../../config/api_config.dart';

class AnnouncementService {
  late final Dio _dio;

  AnnouncementService() {
    _dio = ApiConfig.createDio();
  }

  Future<List<Announcement>> getAnnouncements() async {
    try {
      print('🔄 Getting announcements');

      final response = await _dio.get('/announcements');

      print('✅ Announcements response status: ${response.statusCode}');

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
        final announcements = dataField
            .map((e) => Announcement.fromJson(e as Map<String, dynamic>))
            .toList();
        print('✅ Loaded ${announcements.length} announcements');
        return announcements;
      } else {
        print('⚠️ Data field is not a list: ${dataField.runtimeType}');
        return [];
      }

    } on DioException catch (e) {
      print('❌ Announcements error: ${e.message}');
      throw Exception('Announcements service error: ${e.message}');
    }
  }

  Future<Announcement> getAnnouncementByCategory(String category) async {
    try {
      print('🔄 Getting announcement by category: $category');
      
      final response = await _dio.get('/announcements/category/$category');

      print('✅ Category response status: ${response.statusCode}');
      print('📦 Category response data: ${response.data}');

      if (response.data == null) {
        throw Exception('Response data is null');
      }

      final responseData = response.data as Map<String, dynamic>;
      
      if (responseData['status'] == 'error') {
        throw Exception(responseData['error']?['message'] ?? 'Server error');
      }

      final dataField = responseData['data'];
      if (dataField == null) {
        throw Exception('Data field is null');
      }

      return Announcement.fromJson(dataField as Map<String, dynamic>);
      
    } on DioException catch (e) {
      print('❌ Category error: ${e.message}');
      throw Exception('Get announcement by category error: ${e.message}');
    }
  }
}