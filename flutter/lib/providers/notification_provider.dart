import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/notifications/push_notification_service.dart';

class NotificationState {
  final List<FormattedNotification> notifications;
  final int unreadCount;

  NotificationState({
    required this.notifications,
    required this.unreadCount,
  });

  NotificationState copyWith({
    List<FormattedNotification>? notifications,
    int? unreadCount,
  }) {
    return NotificationState(
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
    );
  }
}

class NotificationNotifier extends StateNotifier<NotificationState> {
  final PushNotificationService _service;

  NotificationNotifier(this._service)
      : super(NotificationState(notifications: [], unreadCount: 0)) {
    _initSampleData();
  }

  void _initSampleData() {
    if (_service.notifications.isNotEmpty) {
      state = NotificationState(
        notifications: List.from(_service.notifications),
        unreadCount: _service.unreadCount,
      );
      return;
    }

    final initialList = [
      FormattedNotification(
        id: 'notif-1',
        title: 'Срочно! Дедлайн через 2 часа',
        body: 'До сдачи задачи "Эссе по литературе (Серебряный век)" осталось всего 2 часа! Поторопитесь.',
        priority: NotificationAlertPriority.urgent,
        hoursRemaining: 2,
        receivedAt: DateTime.now().subtract(const Duration(minutes: 25)),
        payload: {
          'type': 'DEADLINE_ALERT',
          'title': 'Эссе по литературе',
          'subject': 'Литература',
          'hoursRemaining': 2,
        },
        isRead: false,
      ),
      FormattedNotification(
        id: 'notif-2',
        title: 'Изменение в расписании',
        body: 'Замена: 4-й урок "Химия" пройдет в каб. 308 вместо каб. 210 (Преп. Воробьева Е.В.)',
        priority: NotificationAlertPriority.normal,
        hoursRemaining: null,
        receivedAt: DateTime.now().subtract(const Duration(hours: 1, minutes: 10)),
        payload: {
          'type': 'SCHEDULE_CHANGE',
          'subject': 'Химия',
          'room': '308',
        },
        isRead: false,
      ),
      FormattedNotification(
        id: 'notif-3',
        title: 'Напоминание о дедлайне (24 ч)',
        body: 'Напоминаем: срок сдачи задачи "Лабораторная работа №3" (Физика) истекает через 24 ч.',
        priority: NotificationAlertPriority.normal,
        hoursRemaining: 24,
        receivedAt: DateTime.now().subtract(const Duration(hours: 4)),
        payload: {
          'type': 'DEADLINE_ALERT',
          'title': 'Лабораторная работа №3',
          'subject': 'Физика',
          'hoursRemaining': 24,
        },
        isRead: true,
      ),
      FormattedNotification(
        id: 'notif-4',
        title: 'Новое меню столовой',
        body: 'Опубликовано меню на сегодня: Суп-пюре тыквенный, филе индейки с рисом басмати.',
        priority: NotificationAlertPriority.normal,
        hoursRemaining: null,
        receivedAt: DateTime.now().subtract(const Duration(hours: 6)),
        payload: {
          'type': 'CANTEEN_MENU',
        },
        isRead: true,
      ),
    ];

    state = NotificationState(
      notifications: initialList,
      unreadCount: initialList.where((n) => !n.isRead).length,
    );
  }

  void markAsRead(String id) {
    _service.markAsRead(id);
    final updated = state.notifications.map((n) {
      if (n.id == id) {
        return FormattedNotification(
          id: n.id,
          title: n.title,
          body: n.body,
          priority: n.priority,
          hoursRemaining: n.hoursRemaining,
          receivedAt: n.receivedAt,
          payload: n.payload,
          isRead: true,
        );
      }
      return n;
    }).toList();

    state = NotificationState(
      notifications: updated,
      unreadCount: updated.where((n) => !n.isRead).length,
    );
  }

  void markAllAsRead() {
    _service.markAllAsRead();
    final updated = state.notifications.map((n) {
      return FormattedNotification(
        id: n.id,
        title: n.title,
        body: n.body,
        priority: n.priority,
        hoursRemaining: n.hoursRemaining,
        receivedAt: n.receivedAt,
        payload: n.payload,
        isRead: true,
      );
    }).toList();

    state = NotificationState(
      notifications: updated,
      unreadCount: 0,
    );
  }

  void clearAll() {
    _service.clearAll();
    state = NotificationState(
      notifications: [],
      unreadCount: 0,
    );
  }
}

final notificationProvider =
    StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  final service = ref.watch(pushNotificationServiceProvider);
  return NotificationNotifier(service);
});

