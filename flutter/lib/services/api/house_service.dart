import 'package:dio/dio.dart';
import '../../models/api_models.dart';

class HouseService {
  final Dio? _dio;

  HouseService([this._dio]);

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

  Future<HouseCupData> getStandings() async {
    if (_dio == null) {
      throw Exception('Dio client not configured');
    }

    try {
      final response = await _dio!.get('/houses/standings');
      final data = response.data;
      if (data is Map<String, dynamic> && data['status'] == 'success') {
        return HouseCupData.fromJson(data['data'] as Map<String, dynamic>);
      }
      throw Exception('Unexpected response format from house server');
    } on DioException catch (e) {
      throw Exception(_extractErrorMessage(e, 'Ошибка загрузки кубка домов'));
    }
  }

  Future<HouseTransaction> awardPoints({
    required String house,
    required int points,
    required String category,
    required String reason,
    String? studentId,
  }) async {
    if (_dio == null) {
      throw Exception('Dio client not configured');
    }

    try {
      final response = await _dio!.post('/houses/award', data: {
        'house': house,
        'points': points,
        'category': category,
        'reason': reason,
        'studentId': studentId,
      });

      final data = response.data;
      if (data is Map<String, dynamic> && data['status'] == 'success') {
        return HouseTransaction.fromJson(data['data'] as Map<String, dynamic>);
      }
      throw Exception('Failed to award points');
    } on DioException catch (e) {
      throw Exception(_extractErrorMessage(e, 'Ошибка начисления баллов'));
    }
  }
}

