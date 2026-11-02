import 'package:flutter_test/flutter_test.dart';
import 'package:primakov_app/models/api_models.dart';
import 'package:primakov_app/services/notifications/push_notification_service.dart';

void main() {
  late PushNotificationService notificationService;

  setUp(() {
    notificationService = PushNotificationService();
  });

  group('PushNotificationService (Mobile Handler)', () {
    test('formats 24-hour deadline alert correctly', () {
      final payload = {
        'type': 'DEADLINE_ALERT',
        'deadlineId': 'd-101',
        'title': 'Эссе по литературе',
        'subject': 'Литература',
        'hoursRemaining': '24',
        'dueDate': '2026-11-03T10:00:00Z',
      };

      final formatted = notificationService.formatNotification(payload);

      expect(formatted.title, 'Напоминание о дедлайне (24 ч)');
      expect(formatted.body, contains('Эссе по литературе'));
      expect(formatted.body, contains('Литература'));
      expect(formatted.priority, NotificationAlertPriority.normal);
      expect(formatted.hoursRemaining, 24);
    });

    test('formats 2-hour deadline alert as urgent', () {
      final payload = {
        'type': 'DEADLINE_ALERT',
        'deadlineId': 'd-102',
        'title': 'Контрольная работа',
        'subject': 'Алгебра',
        'hoursRemaining': '2',
        'dueDate': '2026-11-02T14:00:00Z',
      };

      final formatted = notificationService.formatNotification(payload);

      expect(formatted.title, 'Срочно! Дедлайн через 2 часа');
      expect(formatted.body, contains('Контрольная работа'));
      expect(formatted.priority, NotificationAlertPriority.urgent);
      expect(formatted.hoursRemaining, 2);
    });

    test('suppresses deadline notifications when disabled in settings', () async {
      final payload = {
        'type': 'DEADLINE_ALERT',
        'deadlineId': 'd-103',
        'title': 'Лабораторная',
        'hoursRemaining': '24',
      };

      const settingsDisabled = NotificationSettings(
        pushEnabled: true,
        deadlineNotifications: false,
      );

      final shouldShow = notificationService.shouldDisplayNotification(payload, settingsDisabled);
      expect(shouldShow, isFalse);

      const allDisabled = NotificationSettings(
        pushEnabled: false,
        deadlineNotifications: true,
      );
      final shouldShowAllDisabled = notificationService.shouldDisplayNotification(payload, allDisabled);
      expect(shouldShowAllDisabled, isFalse);

      const enabled = NotificationSettings(
        pushEnabled: true,
        deadlineNotifications: true,
      );
      final shouldShowEnabled = notificationService.shouldDisplayNotification(payload, enabled);
      expect(shouldShowEnabled, isTrue);
    });

    test('stores incoming notifications and marks them as read', () async {
      final payload = {
        'type': 'DEADLINE_ALERT',
        'deadlineId': 'd-104',
        'title': 'Проект по биологии',
        'subject': 'Биология',
        'hoursRemaining': '24',
      };

      const settings = NotificationSettings(pushEnabled: true, deadlineNotifications: true);
      final item = await notificationService.handleIncomingPayload(payload, settings);

      expect(item, isNotNull);
      expect(notificationService.unreadCount, 1);
      expect(notificationService.notifications.length, 1);

      notificationService.markAsRead(item!.id);
      expect(notificationService.unreadCount, 0);
    });
  });
}

