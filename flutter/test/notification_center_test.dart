import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:primakov_app/widgets/notification_bell_icon.dart';
import 'package:primakov_app/screens/main/notification_center_screen.dart';

void main() {
  testWidgets('NotificationBellIcon shows unread count badge', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: Scaffold(
            body: NotificationBellIcon(),
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    // Default sample data has 2 unread notifications
    expect(find.text('2'), findsOneWidget);
    expect(find.byIcon(Icons.notifications_outlined), findsOneWidget);
  });

  testWidgets('NotificationCenterScreen filters notifications and marks all as read',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: NotificationCenterScreen(),
        ),
      ),
    );

    await tester.pumpAndSettle();

    // Verify title and filters exist
    expect(find.text('Уведомления'), findsOneWidget);
    expect(find.text('Все'), findsOneWidget);
    expect(find.text('Срочные 2ч'), findsOneWidget);
    expect(find.text('Дедлайны 24ч'), findsOneWidget);
    expect(find.text('Расписание'), findsOneWidget);

    // Initial list has urgent item
    expect(find.textContaining('Срочно! Дедлайн через 2 часа'), findsOneWidget);

    // Tap "Срочные 2ч" filter chip
    await tester.tap(find.text('Срочные 2ч'));
    await tester.pumpAndSettle();

    // Urgent item is visible
    expect(find.textContaining('Срочно! Дедлайн через 2 часа'), findsOneWidget);

    // Tap "Прочитать все"
    final readAllBtn = find.text('Прочитать все');
    if (readAllBtn.evaluate().isNotEmpty) {
      await tester.tap(readAllBtn);
      await tester.pumpAndSettle();
    }

    // After read all, button should disappear
    expect(find.text('Прочитать все'), findsNothing);
  });
}

