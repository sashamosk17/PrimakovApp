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
}
