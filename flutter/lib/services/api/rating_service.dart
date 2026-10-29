/// Rating Service
/// Converted from RatingService.ts

import 'package:dio/dio.dart';
import '../../models/api_models.dart';
import '../../config/api_config.dart';

class RatingService {
  late final Dio _dio;

  RatingService() {
    _dio = ApiConfig.createDio();
  }

  Future<List<Rating>> getTeacherRatings(String teacherId) async {
    try {
      final response = await _dio.get(
        '/ratings',
        queryParameters: {'teacherId': teacherId},
      );

      final apiResponse = ApiResponse<List<Rating>>.fromJson(
        response.data as Map<String, dynamic>,
        (data) {
          if (data is List) {
            return data
                .map((e) => Rating.fromJson(e as Map<String, dynamic>))
                .toList();
          }
          return [];
        },
      );

      if (apiResponse.isError) {
        throw Exception(
          apiResponse.error?['message'] ?? 'Failed to fetch ratings',
        );
      }

      return apiResponse.data ?? [];
    } on DioException catch (e) {
      throw Exception('Ratings service error: ${e.message}');
    }
  }

  Future<Rating> rateTeacher(
    String teacherId,
    double rate,
    String comment,
  ) async {
    try {
      final response = await _dio.post(
        '/ratings',
        data: {
          'teacherId': teacherId,
          'rate': rate,
          'comment': comment,
        },
      );

      final apiResponse = ApiResponse<Rating>.fromJson(
        response.data as Map<String, dynamic>,
        (data) => Rating.fromJson(data as Map<String, dynamic>),
      );

      if (apiResponse.isError) {
        throw Exception(
          apiResponse.error?['message'] ?? 'Failed to rate teacher',
        );
      }

      return apiResponse.data!;
    } on DioException catch (e) {
      throw Exception('Rate teacher error: ${e.message}');
    }
  }
}
