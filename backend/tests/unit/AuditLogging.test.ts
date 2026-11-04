import { MockAuditRepository } from "../../src/infrastructure/database/memory/MockAuditRepository";
import { GetAuditLogsUseCase } from "../../src/application/admin/GetAuditLogsUseCase";
import { createAuditMiddleware } from "../../src/presentation/middleware/auditMiddleware";
import { EventEmitter } from "events";

describe("Audit Logging & Control System", () => {
  let auditRepo: MockAuditRepository;
  let useCase: GetAuditLogsUseCase;

  beforeEach(() => {
    auditRepo = new MockAuditRepository();
    useCase = new GetAuditLogsUseCase(auditRepo);
  });

  describe("GetAuditLogsUseCase", () => {
    it("should return empty list when no logs are recorded", async () => {
      const result = await useCase.execute();
      expect(result.isSuccess).toBe(true);
      expect(result.value.logs).toEqual([]);
      expect(result.value.total).toBe(0);
    });

    it("should record entries and retrieve them sorted", async () => {
      await auditRepo.record({
        userId: "user-123",
        userEmail: "admin@primakov.school",
        action: "UPDATE_USER",
        entity: "USER",
        entityId: "target-456",
        details: { role: "TEACHER" },
      });

      await auditRepo.record({
        userId: "user-123",
        userEmail: "admin@primakov.school",
        action: "CREATE_SCHEDULE",
        entity: "SCHEDULE",
        entityId: "sched-789",
      });

      const result = await useCase.execute();
      expect(result.isSuccess).toBe(true);
      expect(result.value.total).toBe(2);
      expect(result.value.logs.length).toBe(2);
      expect(result.value.logs[0].action).toBe("CREATE_SCHEDULE");
      expect(result.value.logs[1].action).toBe("UPDATE_USER");
    });

    it("should filter logs by entity", async () => {
      await auditRepo.record({
        userId: "user-1",
        action: "CREATE_USER",
        entity: "USER",
      });
      await auditRepo.record({
        userId: "user-1",
        action: "CREATE_CANTEEN",
        entity: "CANTEEN",
      });

      const userLogs = await useCase.execute({ entity: "USER" });
      expect(userLogs.isSuccess).toBe(true);
      expect(userLogs.value.logs.length).toBe(1);
      expect(userLogs.value.logs[0].entity).toBe("USER");
    });
  });

  describe("createAuditMiddleware", () => {
    it("should ignore GET requests without recording audit", () => {
      const middleware = createAuditMiddleware(auditRepo);
      const req: any = { method: "GET", path: "/api/admin/users" };
      const res: any = new EventEmitter();
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should intercept POST requests and sanitize passwords", async () => {
      const middleware = createAuditMiddleware(auditRepo);
      const req: any = {
        method: "POST",
        path: "/api/admin/users",
        body: { email: "student@primakov.school", password: "SecretPassword123!" },
        user: { userId: "admin-uuid", email: "admin@primakov.school" },
      };
      const res: any = new EventEmitter();
      res.statusCode = 201;
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();

      // Trigger finish event
      res.emit("finish");

      // Give event loop time to write
      await new Promise((resolve) => setTimeout(resolve, 20));

      const logs = await auditRepo.getRecent();
      expect(logs.isSuccess).toBe(true);
      expect(logs.value.length).toBe(1);
      expect(logs.value[0].action).toBe("CREATE_USER");
      expect(logs.value[0].details?.body.password).toBe("********");
      expect(logs.value[0].details?.body.email).toBe("student@primakov.school");
    });
  });
});

