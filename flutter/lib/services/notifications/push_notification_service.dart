import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/api_models.dart';

enum NotificationAlertPriority {
  normal,
  urgent,
}

class FormattedNotification {
  final String id;
  final String title;
  final String body;
  final NotificationAlertPriority priority;
  final int? hoursRemaining;
  final DateTime receivedAt;
  final Map<String, dynamic> payload;
  bool isRead;

  FormattedNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.priority,
    this.hoursRemaining,
    required this.receivedAt,
    required this.payload,
    this.isRead = false,
  });
}

class PushNotificationService {
  final List<FormattedNotification> _notifications = [];
  final StreamController<FormattedNotification> _notificationStreamController =
      StreamController<FormattedNotification>.broadcast();

  List<FormattedNotification> get notifications => List.unmodifiable(_notifications);
  Stream<FormattedNotification> get onNotificationReceived =>
      _notificationStreamController.stream;

  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  FormattedNotification formatNotification(Map<String, dynamic> payload) {
    final type = payload['type'] as String? ?? 'GENERAL';
    final id = payload['id'] as String? ?? 'notif-${DateTime.now().millisecondsSinceEpoch}';
    final taskTitle = payload['title'] as String? ?? 'Задание';
    final subject = payload['subject'] as String?;

    if (type == 'DEADLINE_ALERT') {
      final hours = int.tryParse(payload['hoursRemaining']?.toString() ?? '24') ?? 24;
      final isUrgent = hours <= 2;
      final subjectPart = subject != null && subject.isNotEmpty ? ' ($subject)' : '';

      final title = isUrgent
          ? 'Срочно! Дедлайн через 2 часа'
          : 'Напоминание о дедлайне (24 ч)';
      final body = isUrgent
          ? 'До сдачи задачи "$taskTitle"$subjectPart осталось всего $hours часа! Поторопитесь.'
          : 'Напоминаем: срок сдачи задачи "$taskTitle"$subjectPart истекает через $hours ч.';

      return FormattedNotification(
        id: id,
        title: title,
        body: body,
        priority: isUrgent ? NotificationAlertPriority.urgent : NotificationAlertPriority.normal,
        hoursRemaining: hours,
        receivedAt: DateTime.now(),
        payload: payload,
      );
    }

    return FormattedNotification(
      id: id,
      title: payload['title'] as String? ?? 'Уведомление школы',
      body: payload['body'] as String? ?? 'Новое школьное событие',
      priority: NotificationAlertPriority.normal,
      receivedAt: DateTime.now(),
      payload: payload,
    );
  }

  bool shouldDisplayNotification(
    Map<String, dynamic> payload,
    NotificationSettings settings,
  ) {
    if (!settings.pushEnabled) return false;

    final type = payload['type'] as String? ?? '';
    if (type == 'DEADLINE_ALERT' && !settings.deadlineNotifications) {
      return false;
    }
    if (type == 'SCHEDULE_CHANGE' && !settings.scheduleNotifications) {
      return false;
    }
    if (type == 'ANNOUNCEMENT' && !settings.announcementNotifications) {
      return false;
    }
    return true;
  }

  Future<FormattedNotification?> handleIncomingPayload(
    Map<String, dynamic> payload,
    NotificationSettings settings,
  ) async {
    if (!shouldDisplayNotification(payload, settings)) {
      return null;
    }

    final formatted = formatNotification(payload);
    _notifications.insert(0, formatted);
    _notificationStreamController.add(formatted);
    return formatted;
  }

  void markAsRead(String id) {
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index != -1) {
      _notifications[index].isRead = true;
    }
  }

  void markAllAsRead() {
    for (final n in _notifications) {
      n.isRead = true;
    }
  }

  void clearAll() {
    _notifications.clear();
  }

  void dispose() {
    _notificationStreamController.close();
  }
}

final pushNotificationServiceProvider = Provider<PushNotificationService>((ref) {
  return PushNotificationService();
});

