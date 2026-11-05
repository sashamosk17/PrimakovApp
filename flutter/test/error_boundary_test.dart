import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:primakov_app/models/api_models.dart';
import 'package:primakov_app/widgets/error_boundary.dart';

void main() {
  group('Announcement Model & Category Field', () {
    test('Announcement parses category correctly when present', () {
      final json = {
        'id': 'ann-1',
        'title': 'Летний лагерь',
        'content': 'Открыта запись в лагерь',
        'category': 'Кампус',
        'createdAt': '2026-06-01T10:00:00.000Z',
      };

      final announcement = Announcement.fromJson(json);

      expect(announcement.id, equals('ann-1'));
      expect(announcement.title, equals('Летний лагерь'));
      expect(announcement.category, equals('Кампус'));
      expect(announcement.content, equals('Открыта запись в лагерь'));
    });

    test('Announcement handles null category gracefully without crashing', () {
      final json = {
        'id': 'ann-2',
        'title': 'Выпускной вечер',
        'content': 'Дорогие выпускники!',
        'createdAt': '2026-05-20T10:00:00.000Z',
      };

      final announcement = Announcement.fromJson(json);

      expect(announcement.category, isNull);
      // Accessing category should not throw NoSuchMethodError!
      final categoryBadge = announcement.category ?? 'ОБЪЯВЛЕНИЕ';
      expect(categoryBadge, equals('ОБЪЯВЛЕНИЕ'));
    });

    test('News model also supports category field', () {
      final news = News(
        id: 'news-1',
        title: 'День гимназии',
        description: 'Праздничный концерт',
        category: 'Мероприятия',
        createdAt: '2026-10-15T09:00:00.000Z',
      );

      expect(news.category, equals('Мероприятия'));
      final json = news.toJson();
      expect(json['category'], equals('Мероприятия'));
    });
  });

  group('GlobalErrorHandler & ErrorBoundary', () {
    setUpAll(() {
      GlobalErrorHandler.init();
    });

    testWidgets('GlobalErrorWidget renders friendly text and retry button', (tester) async {
      bool retried = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlobalErrorWidget(
              errorMessage: 'Test error description',
              onRetry: () {
                retried = true;
              },
            ),
          ),
        ),
      );

      expect(find.text('Не удалось отобразить элемент'), findsOneWidget);
      expect(find.text('Повторить'), findsOneWidget);
      expect(find.text('Подробнее'), findsOneWidget);

      // Tap Retry
      await tester.tap(find.text('Повторить'));
      await tester.pump();
      expect(retried, isTrue);

      // Tap details
      await tester.tap(find.text('Подробнее'));
      await tester.pump();
      expect(find.text('Test error description'), findsOneWidget);
    });

    testWidgets('ErrorWidget.builder uses GlobalErrorWidget instead of Red Screen', (tester) async {
      final details = FlutterErrorDetails(
        exception: Exception('Simulated render error'),
      );

      final widget = ErrorWidget.builder(details);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(body: widget),
        ),
      );

      expect(find.byType(GlobalErrorWidget), findsOneWidget);
      expect(find.text('Не удалось отобразить элемент'), findsOneWidget);
    });

    testWidgets('ErrorBoundary renders child normally when no error occurs', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ErrorBoundary(
              child: Text('Normal Screen Content'),
            ),
          ),
        ),
      );

      expect(find.text('Normal Screen Content'), findsOneWidget);
      expect(find.byType(GlobalErrorWidget), findsNothing);
    });
  });
}

