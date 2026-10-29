import 'package:dio/dio.dart';
import '../../models/api_models.dart';
import '../../config/api_config.dart';

class ScheduleService {
  late final Dio _dio;

  ScheduleService() {
    _dio = ApiConfig.createDio();
  }

 Future<Schedule> getScheduleByDate(String groupId, String date) async {
  try {
    print('🔄 Getting schedule for group: $groupId, date: $date');
    
    final response = await _dio.get('/schedule/user/$groupId/$date');

    print('✅ Schedule response status: ${response.statusCode}');
    print('📦 Schedule response data: ${response.data}');

    if (response.data == null) {
      throw Exception('Response data is null');
    }

    final responseData = response.data as Map<String, dynamic>;
    
    if (responseData['status'] == 'error') {
      throw Exception(responseData['error']?['message'] ?? 'Server error');
    }

    final dataField = responseData['data'];
    if (dataField == null) {
      // Возвращаем пустое расписание вместо ошибки
      print('⚠️ No schedule found for group $groupId on $date, returning empty schedule');
      return Schedule(
        id: 'empty-${DateTime.now().millisecondsSinceEpoch}',
        groupId: groupId,
        date: date,
        lessons: [],
      );
    }

    // 🔥 ПРОВЕРКА: Логируем перед парсингом
    print('📝 Parsing schedule from: $dataField');

    final schedule = Schedule.fromJson(dataField as Map<String, dynamic>);

    // 🔥 ПРОВЕРКА: Логируем результат парсинга
    print('✅ Parsed schedule: ${schedule.id}, lessons: ${schedule.lessons.length}');

    return schedule;
    
  } on DioException catch (e) {
    print('❌ Schedule error: ${e.message}');
    throw Exception('Schedule service error: ${e.message}');
  } catch (e, stackTrace) {
    print('❌ Unexpected error: $e');
    print('📚 Stack trace: $stackTrace');
    throw Exception('Unexpected error: $e');
  }
}
  Future<Lesson> getLessonDetails(String lessonId) async {
    try {
      print('🔄 Getting lesson details: $lessonId');
      
      final response = await _dio.get('/schedule/$lessonId');

      print('✅ Lesson response status: ${response.statusCode}');
      print('📦 Lesson response data: ${response.data}');

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

      return Lesson.fromJson(dataField as Map<String, dynamic>);
      
    } on DioException catch (e) {
      print('❌ Lesson error: ${e.message}');
      throw Exception('Lesson details error: ${e.message}');
    }
  }
}