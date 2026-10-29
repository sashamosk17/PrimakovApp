/// API Configuration
/// Converted from axiosInstance.ts

import 'package:dio/dio.dart';

class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://185.221.198.242:3000/api',
  );

  /// Callback executed when backend returns 401 Unauthorized (e.g. token expired)
  static void Function()? onUnauthorized;

  // Singleton Dio instance
  static final Dio _dio = _createDio();

  static Dio _createDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        contentType: 'application/json',
      ),
    );

    // Request interceptor: Add JWT token to headers
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          print('🌐 Request: ${options.method} ${options.uri}');
          print('🔑 Headers: ${options.headers}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          print('✅ Response: ${response.statusCode} from ${response.requestOptions.uri}');
          return handler.next(response);
        },
        onError: (DioException error, handler) {
          print('❌ DioError type: ${error.type}');
          print('❌ DioError message: ${error.message}');
          print('❌ DioError response: ${error.response}');

          // Handle 401 and logout automatically
          if (error.response?.statusCode == 401) {
            onUnauthorized?.call();
          }
          return handler.next(error);
        },
      ),
    );

    return dio;
  }

  static Dio createDio() {
    return _dio;
  }

  static void setToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  static void clearToken() {
    _dio.options.headers.remove('Authorization');
  }

  static void setBaseUrl(String url) {
    _dio.options.baseUrl = url;
  }
}
