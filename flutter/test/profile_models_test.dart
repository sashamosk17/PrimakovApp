import 'package:flutter_test/flutter_test.dart';
import 'package:primakov_app/models/api_models.dart';

void main() {
  group('Profile Models & Serialization', () {
    test('User serialization with avatarUrl and twoFactorEnabled', () {
      final json = {
        'id': 'user-1',
        'email': 'student@primakov.school',
        'firstName': 'Иван',
        'lastName': 'Петров',
        'role': 'STUDENT',
        'isActive': true,
        'avatarUrl': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        'twoFactorEnabled': true,
      };

      final user = User.fromJson(json);
      expect(user.id, 'user-1');
      expect(user.fullName, 'Иван Петров');
      expect(user.avatarUrl, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400');
      expect(user.twoFactorEnabled, true);

      final serialized = user.toJson();
      expect(serialized['avatarUrl'], user.avatarUrl);
      expect(serialized['twoFactorEnabled'], true);

      final updatedUser = user.copyWith(
        twoFactorEnabled: false,
        avatarUrl: 'https://example.com/new.png',
      );
      expect(updatedUser.twoFactorEnabled, false);
      expect(updatedUser.avatarUrl, 'https://example.com/new.png');
      expect(updatedUser.id, 'user-1');
    });

    test('UserSession parsing and current status check', () {
      final sessionJson = {
        'id': 'session-101',
        'userId': 'user-1',
        'device': 'iPhone 15 Pro',
        'platform': 'ios',
        'ipAddress': '192.168.1.10',
        'location': 'Москва, Россия',
        'lastActiveAt': '2026-10-29T10:00:00.000Z',
        'createdAt': '2026-10-28T08:00:00.000Z',
        'isCurrent': true,
      };

      final session = UserSession.fromJson(sessionJson);
      expect(session.id, 'session-101');
      expect(session.device, 'iPhone 15 Pro');
      expect(session.platform, 'ios');
      expect(session.isCurrent, true);
      expect(session.lastActiveAt.isUtc, true);
    });

    test('UserStats parsing and academic metric calculations', () {
      final statsJson = {
        'userId': 'user-1',
        'gpa': 4.92,
        'attendanceRate': 99.5,
        'totalLessons': 36,
        'completedDeadlines': 14,
        'pendingDeadlines': 2,
      };

      final stats = UserStats.fromJson(statsJson);
      expect(stats.userId, 'user-1');
      expect(stats.gpa, 4.92);
      expect(stats.attendanceRate, 99.5);
      expect(stats.totalLessons, 36);
      expect(stats.completedDeadlines, 14);
      expect(stats.pendingDeadlines, 2);
    });

    test('NotificationSettings toggles and copyWith', () {
      const defaultSettings = NotificationSettings();
      expect(defaultSettings.pushEnabled, true);
      expect(defaultSettings.deadlineNotifications, true);

      final modified = defaultSettings.copyWith(
        pushEnabled: false,
        scheduleNotifications: false,
      );
      expect(modified.pushEnabled, false);
      expect(modified.scheduleNotifications, false);
      expect(modified.deadlineNotifications, true);
      expect(modified.announcementNotifications, true);

      final json = modified.toJson();
      final fromJson = NotificationSettings.fromJson(json);
      expect(fromJson.pushEnabled, false);
      expect(fromJson.scheduleNotifications, false);
      expect(fromJson.deadlineNotifications, true);
    });
  });
}

