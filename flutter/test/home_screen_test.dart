import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import 'package:primakov_app/screens/main/home_screen.dart';
import 'package:primakov_app/models/api_models.dart';
import 'package:primakov_app/providers/auth_provider.dart';
import 'package:primakov_app/services/cache/offline_cache_service.dart';

void main() {
  late Directory tempDir;

  setUpAll(() async {
    tempDir = await Directory.systemTemp.createTemp('hive_home_test_');
    Hive.init(tempDir.path);
    final cache = OfflineCacheService();
    await cache.init();
  });

  tearDownAll(() async {
    await Hive.close();
    if (tempDir.existsSync()) {
      await tempDir.delete(recursive: true);
    }
  });

  testWidgets('HomeScreen renders without throwing', (WidgetTester tester) async {
    final mockUser = User(
      id: 'test-user-1',
      email: 'test@primakov.school',
      firstName: 'Иван',
      lastName: 'Иванов',
      role: UserRole.STUDENT,
      isActive: true,
      groupName: '10А',
      house: 'NORTH',
      isBoarding: true,
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          currentUserProvider.overrideWithValue(mockUser),
        ],
        child: const MaterialApp(
          home: HomeScreen(),
        ),
      ),
    );

    await tester.pump();
    await tester.pump(const Duration(milliseconds: 200));

    expect(find.byType(HomeScreen), findsOneWidget);
  });

  testWidgets('Academic Records & GPA card renders without horizontal overflow on narrow viewport', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    final mockUser = User(
      id: 'test-user-1',
      email: 'test@primakov.school',
      firstName: 'Иван',
      lastName: 'Иванов',
      role: UserRole.STUDENT,
      isActive: true,
      groupName: '10А',
      house: 'NORTH',
      isBoarding: true,
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          currentUserProvider.overrideWithValue(mockUser),
        ],
        child: const MaterialApp(
          home: HomeScreen(),
        ),
      ),
    );

    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(tester.takeException(), isNull);
  });

  testWidgets('News card is interactive, displays full title and allows toggling expand/collapse', (WidgetTester tester) async {
    final mockUser = User(
      id: 'test-user-1',
      email: 'test@primakov.school',
      firstName: 'Иван',
      lastName: 'Иванов',
      role: UserRole.STUDENT,
      isActive: true,
      groupName: '10А',
      house: 'NORTH',
      isBoarding: true,
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          currentUserProvider.overrideWithValue(mockUser),
        ],
        child: const MaterialApp(
          home: HomeScreen(),
        ),
      ),
    );

    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    // Verify News section is displayed
    expect(find.text('Новости гимназии'), findsOneWidget);
    expect(find.text('Читать полностью'), findsOneWidget);

    // Tap to expand
    await tester.tap(find.text('Читать полностью'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 350));

    // After expand, label changes to 'Свернуть'
    expect(find.text('Свернуть'), findsOneWidget);

    // Tap to collapse
    await tester.tap(find.text('Свернуть'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 350));

    expect(find.text('Читать полностью'), findsOneWidget);
  });
}
