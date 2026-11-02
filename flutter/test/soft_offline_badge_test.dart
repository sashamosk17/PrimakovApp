import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:primakov_app/widgets/soft_offline_badge.dart';

void main() {
  testWidgets('SoftOfflineBadge renders cached notice and triggers onRefresh',
      (WidgetTester tester) async {
    bool refreshed = false;
    final now = DateTime.now();

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SoftOfflineBadge(
            lastUpdated: now,
            onRefresh: () {
              refreshed = true;
            },
          ),
        ),
      ),
    );

    // Verify offline banner and message
    expect(find.textContaining('Офлайн-режим'), findsOneWidget);
    expect(find.textContaining('только что'), findsOneWidget);

    // Tap sync / retry icon button
    await tester.tap(find.byType(InkWell));
    await tester.pump();

    expect(refreshed, isTrue);
  });
}

