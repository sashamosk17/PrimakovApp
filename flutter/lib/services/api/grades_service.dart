import 'package:dio/dio.dart';
import '../../models/api_models.dart';

class GradesService {
  final Dio? _dio;

  GradesService([this._dio]);

  Future<List<SubjectGradeSummary>> getMyGrades({String? period}) async {
    if (_dio == null) {
      throw Exception('Dio client not configured');
    }

    try {
      final response = await _dio!.get(
        '/grades/my',
        queryParameters: period != null ? {'period': period} : null,
      );

      final data = response.data;
      if (data is Map<String, dynamic> && data['status'] == 'success') {
        final rawList = data['data'] as List<dynamic>? ?? [];
        return rawList
            .map((e) => SubjectGradeSummary.fromJson(e as Map<String, dynamic>))
            .toList();
      }

      throw Exception('Unexpected response format from grades server');
    } on DioException catch (e) {
      final resData = e.response?.data;
      String? msg;
      if (resData is Map) {
        final err = resData['error'];
        if (err is Map) {
          msg = err['message']?.toString();
        } else if (err is String) {
          msg = err;
        } else if (resData['message'] is String) {
          msg = resData['message'] as String;
        }
      }
      throw Exception(msg ?? e.message ?? 'Ошибка загрузки оценок');
    }
  }
}

