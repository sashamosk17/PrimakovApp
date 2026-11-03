import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:primakov_app/models/api_models.dart';
import 'package:primakov_app/providers/house_provider.dart';
import 'package:primakov_app/services/api/house_service.dart';

class MockSuccessHouseService extends HouseService {
  final List<HouseStanding> standings;
  final List<HouseTransaction> transactions;

  MockSuccessHouseService(this.standings, this.transactions);

  @override
  Future<HouseCupData> getStandings() async {
    return HouseCupData(
      standings: standings,
      recentTransactions: transactions,
    );
  }

  @override
  Future<HouseTransaction> awardPoints({
    required String house,
    required int points,
    required String category,
    required String reason,
    String? studentId,
  }) async {
    return HouseTransaction(
      id: 'tx-new',
      house: house,
      points: points,
      category: category,
      reason: reason,
      awardedBy: 'teacher-1',
      studentId: studentId,
      createdAt: DateTime.now().toIso8601String(),
    );
  }
}

void main() {
  final sampleStandings = [
    HouseStanding(house: 'SOUTH', totalPoints: 320, rank: 1),
    HouseStanding(house: 'WEST', totalPoints: 280, rank: 2),
    HouseStanding(house: 'NORTH', totalPoints: 240, rank: 3),
    HouseStanding(house: 'EAST', totalPoints: 210, rank: 4),
  ];

  final sampleTransactions = [
    HouseTransaction(
      id: 'tx-1',
      house: 'SOUTH',
      points: 50,
      category: 'OLYMPIAD',
      reason: '1 место на региональном этапе ВсОШ',
      awardedBy: 'teacher-1',
      studentId: 'std-1',
      createdAt: '2026-10-20T10:00:00Z',
    ),
  ];

  group('House Identity & Tokens', () {
    test('North House has correct totem, motto and blue color', () {
      final config = HouseConfig.fromHouseName('NORTH');
      expect(config.displayName, 'Север');
      expect(config.totem, 'Белый медведь');
      expect(config.motto, 'Мудрость и стойкость');
      expect(config.color, const Color(0xFF1E88E5));
    });

    test('South House has correct totem, motto and orange color', () {
      final config = HouseConfig.fromHouseName('SOUTH');
      expect(config.displayName, 'Юг');
      expect(config.totem, 'Тигр');
      expect(config.motto, 'Всегда начинай с себя!');
      expect(config.color, const Color(0xFFF57C00));
    });

    test('East House has correct totem, motto and emerald color', () {
      final config = HouseConfig.fromHouseName('EAST');
      expect(config.displayName, 'Восток');
      expect(config.totem, 'Дракон и Панда');
      expect(config.motto, 'Гармония и баланс');
      expect(config.color, const Color(0xFF2E7D32));
    });

    test('West House has correct totem, motto and noble red color', () {
      final config = HouseConfig.fromHouseName('WEST');
      expect(config.displayName, 'Запад');
      expect(config.totem, 'Крылатый лев');
      expect(config.motto, 'Свобода и благородство');
      expect(config.color, const Color(0xFF8B0000));
    });
  });

  group('House Models & Notifier', () {
    test('HouseStanding and HouseTransaction JSON serialization works', () {
      final s = sampleStandings[0];
      final sJson = s.toJson();
      expect(sJson['house'], 'SOUTH');
      expect(sJson['totalPoints'], 320);
      expect(sJson['rank'], 1);

      final sRestored = HouseStanding.fromJson(sJson);
      expect(sRestored.house, 'SOUTH');
      expect(sRestored.totalPoints, 320);

      final t = sampleTransactions[0];
      final tJson = t.toJson();
      expect(tJson['points'], 50);
      final tRestored = HouseTransaction.fromJson(tJson);
      expect(tRestored.id, 'tx-1');
      expect(tRestored.category, 'OLYMPIAD');
    });

    test('HouseNotifier loads standings from service', () async {
      final mockService = MockSuccessHouseService(sampleStandings, sampleTransactions);
      final notifier = HouseNotifier(mockService);

      await notifier.loadStandings();

      expect(notifier.state.hasValue, isTrue);
      expect(notifier.state.value?.standings.length, 4);
      expect(notifier.state.value?.standings[0].house, 'SOUTH');
      expect(notifier.state.value?.recentTransactions.length, 1);
    });
  });
}

