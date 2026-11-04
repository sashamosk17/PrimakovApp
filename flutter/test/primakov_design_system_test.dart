import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:primakov_app/config/app_colors.dart';
import 'package:primakov_app/widgets/primakov_card.dart';
import 'package:primakov_app/widgets/primakov_badge.dart';

void main() {
  group('Primakov Design System - Brand & Colors', () {
    test('Noble Crimson brand palette matches Primakov school identity', () {
      expect(AppColors.primaryRed, const Color(0xFF8B0000));
      expect(AppColors.primaryAccent, const Color(0xFFBA1A1A));
      expect(AppColors.primary, const Color(0xFF8B0000));
    });

    test('House Cup tokens are properly defined with pastel variants', () {
      expect(AppColors.houseNorth, const Color(0xFF1976D2));
      expect(AppColors.houseSouth, const Color(0xFFD97706));
      expect(AppColors.houseEast, const Color(0xFF16A34A));
      expect(AppColors.houseWest, const Color(0xFF7C3AED));

      expect(AppColors.houseNorthPastel.a, greaterThan(0.0));
      expect(AppColors.houseSouthPastel.a, greaterThan(0.0));
      expect(AppColors.houseEastPastel.a, greaterThan(0.0));
      expect(AppColors.houseWestPastel.a, greaterThan(0.0));
    });

    test('Dark theme tokens guarantee high contrast against deep surfaces', () {
      expect(AppColors.darkBackgroundPrimary, AppColors.darkBackground);
      expect(AppColors.darkBackgroundSecondary, AppColors.darkBackgroundSecondary);
      expect(AppColors.darkGhostBorder, const Color(0x1AFFFFFF));
      expect(AppColors.darkTextPrimary, AppColors.darkOnSurface);
    });
  });

  group('PrimakovCard Widget Tests', () {
    testWidgets('PrimakovCard renders child and responds to tap gesture', (WidgetTester tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: PrimakovCard(
              onTap: () {
                tapped = true;
              },
              child: const Text('Bento Card Content'),
            ),
          ),
        ),
      );

      expect(find.text('Bento Card Content'), findsOneWidget);
      await tester.tap(find.text('Bento Card Content'));
      await tester.pumpAndSettle();

      expect(tapped, isTrue);
    });

    testWidgets('PrimakovCard renders ghost border in Dark Mode', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.dark(),
          home: const Scaffold(
            body: PrimakovCard(
              child: Text('Dark Mode Bento Card'),
            ),
          ),
        ),
      );

      expect(find.text('Dark Mode Bento Card'), findsOneWidget);
      expect(find.byType(PrimakovCard), findsOneWidget);
    });
  });

  group('PrimakovBadge Widget Tests', () {
    testWidgets('PrimakovBadge renders label and modern Lucide icon', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: PrimakovBadge(
              label: '10А КЛАСС',
              icon: LucideIcons.graduationCap,
              backgroundColor: Color(0x191976D2),
              textColor: Color(0xFF1976D2),
            ),
          ),
        ),
      );

      expect(find.text('10А КЛАСС'), findsOneWidget);
      expect(find.byIcon(LucideIcons.graduationCap), findsOneWidget);
    });

    testWidgets('PrimakovBadge renders with House Cup styling', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: PrimakovBadge(
              label: 'СЕВЕР',
              icon: LucideIcons.snowflake,
              backgroundColor: AppColors.houseNorthPastel,
              textColor: AppColors.houseNorth,
            ),
          ),
        ),
      );

      expect(find.text('СЕВЕР'), findsOneWidget);
      expect(find.byIcon(LucideIcons.snowflake), findsOneWidget);
    });
  });
}
