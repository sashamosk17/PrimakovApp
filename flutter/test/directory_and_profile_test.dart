import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:primakov_app/models/api_models.dart';
import 'package:primakov_app/screens/main/people_directory_screen.dart';
import 'package:primakov_app/screens/main/user_profile_detail_screen.dart';

void main() {
  group('People Directory & User Profile Widget Tests', () {
    testWidgets('PeopleDirectoryScreen renders search bar and filter chips', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: PeopleDirectoryScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify Header and Search Field
      expect(find.text('Справочник гимназии'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);

      // Verify Role Chips
      expect(find.text('Все'), findsOneWidget);
      expect(find.text('Учащиеся'), findsOneWidget);
      expect(find.text('Преподаватели'), findsOneWidget);

      // Verify Class Chips
      expect(find.text('Все классы'), findsOneWidget);
      expect(find.text('10-А'), findsWidgets);
    });

    testWidgets('UserProfileDetailScreen renders user details, birthday, contacts, and timetable', (tester) async {
      final testStudent = User(
        id: 'user-test-1',
        email: 'artem.smirnov.10a@primakov.school',
        firstName: 'Артем',
        lastName: 'Смирнов',
        role: UserRole.STUDENT,
        isActive: true,
        groupName: '10-А',
        birthDate: '2010-04-15',
        phone: '+7 (999) 101-20-01',
        telegram: '@artem_smirnov_10a',
        isBirthdayToday: true,
      );

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: UserProfileDetailScreen(initialUser: testStudent),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify Name & Role & Class
      expect(find.text('Смирнов Артем'), findsOneWidget);
      expect(find.text('Учащийся'), findsOneWidget);
      expect(find.text('10-А'), findsOneWidget);

      // Verify Contact Action Buttons
      expect(find.text('Звонок'), findsOneWidget);
      expect(find.text('Почта'), findsOneWidget);
      expect(find.text('Telegram'), findsWidgets);

      // Verify Birthday & Email info
      expect(find.text('Дата рождения'), findsOneWidget);
      expect(find.text('artem.smirnov.10a@primakov.school'), findsOneWidget);
      expect(find.text('+7 (999) 101-20-01'), findsOneWidget);
      expect(find.text('@artem_smirnov_10a'), findsOneWidget);

      // Verify Timetable Section
      expect(find.text('Расписание на сегодня'), findsOneWidget);
    });
  });
}
