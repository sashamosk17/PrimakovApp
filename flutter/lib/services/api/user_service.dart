/// User Service
/// API service for user-related operations

import 'package:dio/dio.dart';
import '../../config/api_config.dart';
import '../../models/api_models.dart';

class Teacher {
  final String id;
  final String firstName;
  final String lastName;
  final String fullName;

  Teacher({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.fullName,
  });

  factory Teacher.fromJson(Map<String, dynamic> json) {
    return Teacher(
      id: json['id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      fullName: json['fullName'] as String,
    );
  }
}

class UserService {
  late final Dio _dio;

  UserService() {
    _dio = ApiConfig.createDio();
  }

  Future<List<Teacher>> getTeachers() async {
    try {
      final response = await _dio.get('/users/teachers');

      if (response.data['status'] == 'success') {
        final data = response.data['data'] as List;
        return data.map((e) => Teacher.fromJson(e as Map<String, dynamic>)).toList();
      }

      return _defaultTeachers;
    } catch (_) {
      return _defaultTeachers;
    }
  }

  // НОВЫЙ: GET /api/users/me
  Future<User> getCurrentUser() async {
    try {
      final response = await _dio.get('/users/me');
      final responseData = response.data as Map<String, dynamic>;

      if (responseData['status'] == 'error') {
        throw Exception(responseData['error']?['message'] ?? 'Failed to load profile');
      }

      final data = responseData['data'] as Map<String, dynamic>;
      return User.fromJson(data);
    } on DioException catch (e) {
      throw Exception('Failed to load profile: ${e.message}');
    }
  }

  // PUT /api/users/me
  Future<User> updateProfile({
    String? firstName,
    String? lastName,
    String? avatarUrl,
    bool? twoFactorEnabled,
    String? birthDate,
    String? phone,
    String? telegram,
  }) async {
    try {
      final response = await _dio.put(
        '/users/me',
        data: {
          if (firstName != null) 'firstName': firstName,
          if (lastName != null) 'lastName': lastName,
          if (avatarUrl != null) 'avatarUrl': avatarUrl,
          if (twoFactorEnabled != null) 'twoFactorEnabled': twoFactorEnabled,
          if (birthDate != null) 'birthDate': birthDate,
          if (phone != null) 'phone': phone,
          if (telegram != null) 'telegram': telegram,
        },
      );

      final responseData = response.data as Map<String, dynamic>;

      if (responseData['status'] == 'error') {
        throw Exception(responseData['error']?['message'] ?? 'Failed to update profile');
      }

      final data = responseData['data'] as Map<String, dynamic>;
      return User.fromJson(data);
    } on DioException catch (e) {
      throw Exception('Failed to update profile: ${e.message}');
    }
  }

  // GET /api/users/me/sessions
  Future<List<UserSession>> getSessions() async {
    try {
      final response = await _dio.get('/users/me/sessions');
      final responseData = response.data as Map<String, dynamic>;

      if (responseData['status'] == 'error') {
        throw Exception(responseData['error']?['message'] ?? 'Failed to load sessions');
      }

      final data = responseData['data'] as List;
      return data.map((e) => UserSession.fromJson(e as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw Exception('Failed to load sessions: ${e.message}');
    }
  }

  // DELETE /api/users/me/sessions/:sessionId
  Future<void> revokeSession(String sessionId) async {
    try {
      final response = await _dio.delete('/users/me/sessions/$sessionId');
      final responseData = response.data as Map<String, dynamic>;

      if (responseData['status'] == 'error') {
        throw Exception(responseData['error']?['message'] ?? 'Failed to revoke session');
      }
    } on DioException catch (e) {
      throw Exception('Failed to revoke session: ${e.message}');
    }
  }

  // GET /api/users/me/stats
  Future<UserStats> getStats() async {
    try {
      final response = await _dio.get('/users/me/stats');
      final responseData = response.data as Map<String, dynamic>;

      if (responseData['status'] == 'error') {
        throw Exception(responseData['error']?['message'] ?? 'Failed to load stats');
      }

      final data = responseData['data'] as Map<String, dynamic>;
      return UserStats.fromJson(data);
    } on DioException catch (e) {
      throw Exception('Failed to load stats: ${e.message}');
    }
  }

  // GET /api/users/me/notifications
  Future<NotificationSettings> getNotificationSettings() async {
    try {
      final response = await _dio.get('/users/me/notifications');
      final responseData = response.data as Map<String, dynamic>;

      if (responseData['status'] == 'error') {
        throw Exception(responseData['error']?['message'] ?? 'Failed to load notification settings');
      }

      final data = responseData['data'] as Map<String, dynamic>;
      return NotificationSettings.fromJson(data);
    } on DioException catch (e) {
      throw Exception('Failed to load notification settings: ${e.message}');
    }
  }

  // PUT /api/users/me/notifications
  Future<NotificationSettings> updateNotificationSettings(NotificationSettings settings) async {
    try {
      final response = await _dio.put(
        '/users/me/notifications',
        data: settings.toJson(),
      );
      final responseData = response.data as Map<String, dynamic>;

      if (responseData['status'] == 'error') {
        throw Exception(responseData['error']?['message'] ?? 'Failed to update notification settings');
      }

      final data = responseData['data'] as Map<String, dynamic>;
      return NotificationSettings.fromJson(data);
    } on DioException catch (e) {
      throw Exception('Failed to update notification settings: ${e.message}');
    }
  }

  // НОВЫЙ: PUT /api/users/me/password
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await _dio.put(
        '/users/me/password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );

      final responseData = response.data as Map<String, dynamic>;

      if (responseData['status'] == 'error') {
        throw Exception(responseData['error']?['message'] ?? 'Failed to change password');
      }
    } on DioException catch (e) {
      throw Exception('Failed to change password: ${e.message}');
    }
  }

  // GET /api/users/directory
  Future<List<User>> searchDirectory({
    String? query,
    String? role,
    String? groupName,
  }) async {
    try {
      final response = await _dio.get(
        '/users/directory',
        queryParameters: {
          if (query != null && query.isNotEmpty) 'query': query,
          if (role != null && role.isNotEmpty) 'role': role,
          if (groupName != null && groupName.isNotEmpty) 'groupName': groupName,
          'limit': 100,
        },
      );

      final responseData = response.data as Map<String, dynamic>;
      if (responseData['status'] == 'success') {
        final data = responseData['data'] as Map<String, dynamic>;
        final usersList = data['users'] as List? ?? [];
        return usersList.map((e) => User.fromJson(e as Map<String, dynamic>)).toList();
      }

      return _fallbackDirectory(query: query, role: role, groupName: groupName);
    } catch (_) {
      return _fallbackDirectory(query: query, role: role, groupName: groupName);
    }
  }

  // GET /api/users/:id/profile
  Future<UserProfileData> getUserProfile(String userId, {String? date}) async {
    try {
      final response = await _dio.get(
        '/users/$userId/profile',
        queryParameters: {
          if (date != null) 'date': date,
        },
      );

      final responseData = response.data as Map<String, dynamic>;
      if (responseData['status'] == 'success') {
        final data = responseData['data'] as Map<String, dynamic>;
        return UserProfileData.fromJson(data);
      }

      return _fallbackUserProfile(userId);
    } catch (_) {
      return _fallbackUserProfile(userId);
    }
  }

  static final List<Teacher> _defaultTeachers = [
    Teacher(id: 'teacher-1', firstName: 'Анна', lastName: 'Смирнова', fullName: 'Смирнова Анна'),
    Teacher(id: 'teacher-2', firstName: 'Дмитрий', lastName: 'Волков', fullName: 'Волков Дмитрий'),
    Teacher(id: 'teacher-3', firstName: 'Елена', lastName: 'Соколова', fullName: 'Соколова Елена'),
    Teacher(id: 'teacher-4', firstName: 'Михаил', lastName: 'Васильев', fullName: 'Васильев Михаил'),
    Teacher(id: 'teacher-5', firstName: 'Ольга', lastName: 'Морозова', fullName: 'Морозова Ольга'),
    Teacher(id: 'teacher-6', firstName: 'Сергей', lastName: 'Кузнецов', fullName: 'Кузнецов Сергей'),
    Teacher(id: 'teacher-7', firstName: 'Татьяна', lastName: 'Павлова', fullName: 'Павлова Татьяна'),
    Teacher(id: 'teacher-8', firstName: 'Игорь', lastName: 'Семенов', fullName: 'Семенов Игорь'),
  ];

  static List<User> _fallbackDirectory({String? query, String? role, String? groupName}) {
    final all = [
      User(
        id: 'teacher-1',
        email: 'anna.smirnova@primakov.school',
        firstName: 'Анна',
        lastName: 'Смирнова',
        role: UserRole.TEACHER,
        isActive: true,
        phone: '+7 (999) 111-22-33',
        telegram: '@smirnova_math',
        birthDate: '1985-04-12',
        isBirthdayToday: false,
      ),
      User(
        id: 'teacher-2',
        email: 'dmitriy.volkov@primakov.school',
        firstName: 'Дмитрий',
        lastName: 'Волков',
        role: UserRole.TEACHER,
        isActive: true,
        phone: '+7 (999) 222-33-44',
        telegram: '@volkov_phys',
        birthDate: '1979-11-20',
        isBirthdayToday: false,
      ),
      User(
        id: 'teacher-3',
        email: 'elena.sokolova@primakov.school',
        firstName: 'Елена',
        lastName: 'Соколова',
        role: UserRole.TEACHER,
        isActive: true,
        phone: '+7 (999) 333-44-55',
        telegram: '@sokolova_chem',
        birthDate: '1988-08-14',
        isBirthdayToday: false,
      ),
      User(
        id: 'student-10a-1',
        email: 'artem.smirnov.10a@primakov.school',
        firstName: 'Артем',
        lastName: 'Смирнов',
        role: UserRole.STUDENT,
        isActive: true,
        groupName: '10-А',
        phone: '+7 (999) 101-20-01',
        telegram: '@artem_smirnov_10a',
        birthDate: '2009-03-15',
        isBirthdayToday: true,
      ),
      User(
        id: 'student-10a-2',
        email: 'alisa.ivanova.10a@primakov.school',
        firstName: 'Алиса',
        lastName: 'Иванова',
        role: UserRole.STUDENT,
        isActive: true,
        groupName: '10-А',
        phone: '+7 (999) 101-20-02',
        telegram: '@alisa_iv_10a',
        birthDate: '2009-07-22',
        isBirthdayToday: false,
      ),
      User(
        id: 'student-11b-1',
        email: 'maksim.kuznetsov.11b@primakov.school',
        firstName: 'Максим',
        lastName: 'Кузнецов',
        role: UserRole.STUDENT,
        isActive: true,
        groupName: '11-Б',
        phone: '+7 (999) 112-20-01',
        telegram: '@max_kuzn_11b',
        birthDate: '2008-01-30',
        isBirthdayToday: false,
      ),
      User(
        id: 'student-9v-1',
        email: 'polina.fedorova.9v@primakov.school',
        firstName: 'Полина',
        lastName: 'Федорова',
        role: UserRole.STUDENT,
        isActive: true,
        groupName: '9-В',
        phone: '+7 (999) 109-20-01',
        telegram: '@polina_fed_9v',
        birthDate: '2010-09-05',
        isBirthdayToday: false,
      ),
    ];

    return all.where((u) {
      if (role != null && role.isNotEmpty && u.role.name != role) return false;
      if (groupName != null && groupName.isNotEmpty && u.groupName != groupName) return false;
      if (query != null && query.trim().isNotEmpty) {
        final q = query.trim().toLowerCase();
        final matchesName = '${u.lastName} ${u.firstName}'.toLowerCase().contains(q) ||
            '${u.firstName} ${u.lastName}'.toLowerCase().contains(q);
        final matchesClass = u.groupName?.toLowerCase().contains(q) ?? false;
        final matchesRole = u.role.name.toLowerCase().contains(q);
        return matchesName || matchesClass || matchesRole;
      }
      return true;
    }).toList();
  }

  static UserProfileData _fallbackUserProfile(String userId) {
    final users = _fallbackDirectory();
    final user = users.firstWhere(
      (u) => u.id == userId,
      orElse: () => User(
        id: userId,
        email: 'user@primakov.school',
        firstName: 'Пользователь',
        lastName: 'Гимназии',
        role: UserRole.STUDENT,
        isActive: true,
        groupName: '10-А',
      ),
    );

    return UserProfileData(
      user: user,
      todayLessons: [
        Lesson(
          id: 'l-1',
          subject: 'Алгебра и начала анализа',
          teacherId: 'teacher-1',
          teacherName: 'Смирнова Анна',
          room: 'Кабинет 302',
          floor: 3,
          startTime: '08:30',
          endTime: '09:15',
          hasHomework: false,
        ),
        Lesson(
          id: 'l-2',
          subject: 'Английский язык',
          teacherId: 'teacher-2',
          teacherName: 'Brown Sarah',
          room: 'Кабинет 410',
          floor: 4,
          startTime: '09:30',
          endTime: '10:15',
          hasHomework: false,
        ),
        Lesson(
          id: 'l-3',
          subject: 'Физика',
          teacherId: 'teacher-3',
          teacherName: 'Волков Дмитрий',
          room: 'Лаборатория 204',
          floor: 2,
          startTime: '10:35',
          endTime: '11:20',
          hasHomework: false,
        ),
      ],
    );
  }
}
