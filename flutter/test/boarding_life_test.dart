import 'package:flutter_test/flutter_test.dart';
import 'package:primakov_app/models/api_models.dart';
import 'package:primakov_app/providers/boarding_provider.dart';
import 'package:primakov_app/services/api/boarding_service.dart';

class MockSuccessBoardingService extends BoardingService {
  final BoardingStatusResponse statusResponse;
  MockSuccessBoardingService(this.statusResponse);

  @override
  Future<BoardingStatusResponse> getMyStatus() async {
    return statusResponse;
  }

  @override
  Future<BoardingCheckInItem> checkIn({
    String? notes,
    double? latitude,
    double? longitude,
  }) async {
    return BoardingCheckInItem(
      id: 'c-new',
      studentId: 'std-1',
      checkInTime: DateTime.now().toIso8601String(),
      status: 'PRESENT',
      notes: notes ?? 'Кампус Раздоры',
    );
  }

  @override
  Future<WeekendLeaveRequestItem> createLeaveRequest({
    required String departureDate,
    required String returnDate,
    required String transportType,
    bool guardianConfirmed = false,
  }) async {
    return WeekendLeaveRequestItem(
      id: 'l-new',
      studentId: 'std-1',
      departureDate: departureDate,
      returnDate: returnDate,
      transportType: transportType,
      status: 'PENDING',
      guardianConfirmed: guardianConfirmed,
    );
  }
}

void main() {
  final sampleCheckIn = BoardingCheckInItem(
    id: 'c-1',
    studentId: 'std-1',
    checkInTime: '2026-10-25T21:05:00Z',
    status: 'PRESENT',
    notes: 'Корпус 2',
  );

  final sampleLeave = WeekendLeaveRequestItem(
    id: 'l-1',
    studentId: 'std-1',
    departureDate: '2026-10-30T17:00:00Z',
    returnDate: '2026-11-01T21:00:00Z',
    transportType: 'SHUTTLE',
    status: 'PENDING',
    guardianConfirmed: true,
  );

  final sampleStatus = BoardingStatusResponse(
    lastCheckIn: sampleCheckIn,
    activeLeave: sampleLeave,
    recentCheckIns: [sampleCheckIn],
  );

  group('Boarding Models & Notifier', () {
    test('BoardingCheckInItem serialization works', () {
      final json = sampleCheckIn.toJson();
      expect(json['id'], 'c-1');
      expect(json['status'], 'PRESENT');

      final restored = BoardingCheckInItem.fromJson(json);
      expect(restored.id, 'c-1');
      expect(restored.status, 'PRESENT');
      expect(restored.notes, 'Корпус 2');
    });

    test('WeekendLeaveRequestItem serialization works', () {
      final json = sampleLeave.toJson();
      expect(json['id'], 'l-1');
      expect(json['transportType'], 'SHUTTLE');
      expect(json['guardianConfirmed'], true);

      final restored = WeekendLeaveRequestItem.fromJson(json);
      expect(restored.id, 'l-1');
      expect(restored.transportType, 'SHUTTLE');
    });

    test('BoardingNotifier loads status and records check-in', () async {
      final mockService = MockSuccessBoardingService(sampleStatus);
      final notifier = BoardingNotifier(mockService);

      await notifier.loadStatus();

      expect(notifier.state.hasValue, isTrue);
      expect(notifier.state.value?.lastCheckIn?.status, 'PRESENT');

      final checkInResult = await notifier.submitCheckIn(notes: 'Корпус 1');
      expect(checkInResult, isTrue);
    });
  });
}

