import { BoardingCheckIn } from "../../src/domain/entities/BoardingCheckIn";
import { WeekendLeaveRequest } from "../../src/domain/entities/WeekendLeaveRequest";
import { MockBoardingRepository } from "../../src/infrastructure/database/memory/MockBoardingRepository";
import { MockUserRepository } from "../../src/infrastructure/database/memory/MockUserRepository";
import { BoardingCheckInUseCase } from "../../src/application/boarding/BoardingCheckInUseCase";
import { GetStudentBoardingStatusUseCase } from "../../src/application/boarding/GetStudentBoardingStatusUseCase";
import { CreateWeekendLeaveRequestUseCase } from "../../src/application/boarding/CreateWeekendLeaveRequestUseCase";
import { UpdateLeaveRequestStatusUseCase } from "../../src/application/boarding/UpdateLeaveRequestStatusUseCase";
import { User } from "../../src/domain/entities/User";
import { Email } from "../../src/domain/value-objects/Email";
import { Password } from "../../src/domain/value-objects/Password";

describe("Boarding Life Domain & Use Cases", () => {
  let boardingRepo: MockBoardingRepository;
  let userRepo: MockUserRepository;
  let boardingStudent: User;

  beforeEach(() => {
    boardingRepo = new MockBoardingRepository();
    userRepo = new MockUserRepository();

    boardingStudent = new User(
      "student-b-1",
      Email.create("boarding.student@primakov.school").value,
      Password.fromHash("hash12345678"),
      "Даниил",
      "Смирнов",
      "STUDENT",
      new Date(),
      undefined,
      true,
      undefined,
      undefined,
      false,
      undefined,
      "11Б",
      undefined,
      undefined,
      undefined,
      "WEST",
      true // isBoarding
    );
    userRepo.save(boardingStudent);
  });

  describe("Entities", () => {
    it("should instantiate BoardingCheckIn correctly", () => {
      const checkIn = new BoardingCheckIn(
        "checkin-1",
        boardingStudent.id,
        new Date("2026-10-25T21:05:00Z"),
        "PRESENT",
        "Корпус 2, комната 304"
      );

      expect(checkIn.id).toBe("checkin-1");
      expect(checkIn.studentId).toBe(boardingStudent.id);
      expect(checkIn.status).toBe("PRESENT");
      expect(checkIn.notes).toContain("Корпус 2");
    });

    it("should instantiate WeekendLeaveRequest correctly", () => {
      const req = new WeekendLeaveRequest(
        "req-1",
        boardingStudent.id,
        "2026-10-30T17:00:00Z",
        "2026-11-01T21:00:00Z",
        "SHUTTLE",
        "PENDING",
        true
      );

      expect(req.transportType).toBe("SHUTTLE");
      expect(req.status).toBe("PENDING");
      expect(req.guardianConfirmed).toBe(true);
    });
  });

  describe("BoardingCheckInUseCase", () => {
    it("should register evening check-in and return success", async () => {
      const useCase = new BoardingCheckInUseCase(boardingRepo);

      const result = await useCase.execute({
        studentId: boardingStudent.id,
        notes: "Геопозиция кампуса подтверждена",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe("PRESENT");

      const statusResult = await boardingRepo.getStudentStatus(boardingStudent.id);
      expect(statusResult.lastCheckIn).toBeDefined();
      expect(statusResult.lastCheckIn?.studentId).toBe(boardingStudent.id);
    });
  });

  describe("CreateWeekendLeaveRequestUseCase", () => {
    it("should create leave request with valid parameters", async () => {
      const useCase = new CreateWeekendLeaveRequestUseCase(boardingRepo);

      const result = await useCase.execute({
        studentId: boardingStudent.id,
        departureDate: "2026-10-30T18:00:00Z",
        returnDate: "2026-11-01T20:00:00Z",
        transportType: "PARENTS",
        guardianConfirmed: true,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value.transportType).toBe("PARENTS");
      expect(result.value.status).toBe("PENDING");
    });
  });

  describe("GetStudentBoardingStatusUseCase", () => {
    it("should return student boarding status, last check-in and active leaves", async () => {
      const checkIn = new BoardingCheckIn(
        "checkin-1",
        boardingStudent.id,
        new Date(),
        "PRESENT",
        "Кампус Раздоры"
      );
      await boardingRepo.checkIn(checkIn);

      const useCase = new GetStudentBoardingStatusUseCase(boardingRepo);
      const result = await useCase.execute({ studentId: boardingStudent.id });

      expect(result.isSuccess).toBe(true);
      expect(result.value.lastCheckIn).toBeDefined();
      expect(result.value.lastCheckIn?.status).toBe("PRESENT");
    });
  });

  describe("UpdateLeaveRequestStatusUseCase", () => {
    it("should approve or reject weekend leave request", async () => {
      const leaveRequest = new WeekendLeaveRequest(
        "leave-1",
        boardingStudent.id,
        "2026-10-30T18:00:00Z",
        "2026-11-01T20:00:00Z",
        "PARENTS",
        "PENDING",
        true,
        new Date()
      );
      await boardingRepo.createLeaveRequest(leaveRequest);

      const updateUseCase = new UpdateLeaveRequestStatusUseCase(boardingRepo);
      const approveRes = await updateUseCase.execute({
        requestId: "leave-1",
        status: "APPROVED",
      });

      expect(approveRes.isSuccess).toBe(true);
      const requests = await boardingRepo.getLeaveRequests(boardingStudent.id);
      expect(requests.find((r) => r.id === "leave-1")?.status).toBe("APPROVED");
    });
  });
});

