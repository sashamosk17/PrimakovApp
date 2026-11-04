import { MockRequestRepository } from "../../src/infrastructure/database/memory/MockRequestRepository";
import { MockAuditRepository } from "../../src/infrastructure/database/memory/MockAuditRepository";
import { TicketAutoRouter } from "../../src/domain/services/TicketAutoRouter";
import { ServiceDeskSLAWorker } from "../../src/application/request/ServiceDeskSLAWorker";
import { Request } from "../../src/domain/repositories/IRequestRepository";

describe("Service Desk SLA Watchdog & Auto-Routing", () => {
  let requestRepo: MockRequestRepository;
  let auditRepo: MockAuditRepository;
  let slaWorker: ServiceDeskSLAWorker;

  beforeEach(() => {
    requestRepo = new MockRequestRepository();
    auditRepo = new MockAuditRepository();
    slaWorker = new ServiceDeskSLAWorker(requestRepo, auditRepo);
  });

  afterEach(() => {
    slaWorker.stop();
  });

  describe("TicketAutoRouter Domain Service", () => {
    it("calculates correct SLA deadlines based on priority tier", () => {
      const now = new Date("2026-11-04T12:00:00.000Z");

      const urgentDeadline = TicketAutoRouter.calculateSlaDeadline(now, "URGENT");
      expect(urgentDeadline.getTime() - now.getTime()).toBe(2 * 60 * 60 * 1000); // 2 hours

      const highDeadline = TicketAutoRouter.calculateSlaDeadline(now, "HIGH");
      expect(highDeadline.getTime() - now.getTime()).toBe(4 * 60 * 60 * 1000); // 4 hours

      const mediumDeadline = TicketAutoRouter.calculateSlaDeadline(now, "MEDIUM");
      expect(mediumDeadline.getTime() - now.getTime()).toBe(24 * 60 * 60 * 1000); // 24 hours

      const lowDeadline = TicketAutoRouter.calculateSlaDeadline(now, "LOW");
      expect(lowDeadline.getTime() - now.getTime()).toBe(48 * 60 * 60 * 1000); // 48 hours
    });

    it("determines department routing according to request type", () => {
      const itRoute = TicketAutoRouter.determineRouting("IT");
      expect(itRoute.department).toBe("IT-служба");
      expect(itRoute.defaultAssigneeEmail).toBe("it-support@primakov.school");

      const cleaningRoute = TicketAutoRouter.determineRouting("CLEANING");
      expect(cleaningRoute.department).toBe("Служба клининга");

      const maintenanceRoute = TicketAutoRouter.determineRouting("MAINTENANCE");
      expect(maintenanceRoute.department).toBe("Инженерная служба");
    });
  });

  describe("ServiceDeskSLAWorker Watchdog", () => {
    it("detects overdue tickets, marks slaBreached=true, and emits audit alert", async () => {
      // Create a ticket created 5 hours ago with HIGH priority (SLA is 4 hours -> already breached)
      const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
      const overdueTicket: Request = {
        id: "req-overdue-1",
        type: "IT",
        title: "Не работает интерактивная доска",
        description: "В кабинете 405 не реагирует сенсор",
        status: "PENDING",
        priority: "HIGH",
        creatorId: "teacher-1",
        createdAt: fiveHoursAgo,
        updatedAt: fiveHoursAgo,
        slaDeadlineAt: new Date(fiveHoursAgo.getTime() + 4 * 60 * 60 * 1000),
        slaBreached: false,
      };

      // Create a ticket created 10 minutes ago with HIGH priority (SLA is 4 hours -> NOT breached)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const activeTicket: Request = {
        id: "req-active-2",
        type: "MAINTENANCE",
        title: "Заменить лампу",
        description: "Мерцает лампа в коридоре 2 этажа",
        status: "PENDING",
        priority: "HIGH",
        creatorId: "teacher-2",
        createdAt: tenMinutesAgo,
        updatedAt: tenMinutesAgo,
        slaDeadlineAt: new Date(tenMinutesAgo.getTime() + 4 * 60 * 60 * 1000),
        slaBreached: false,
      };

      await requestRepo.save(overdueTicket);
      await requestRepo.save(activeTicket);

      const result = await slaWorker.tick();

      expect(result.isSuccess).toBe(true);
      expect(result.value.newlyBreached).toBeGreaterThanOrEqual(1);

      // Verify overdue ticket is now flagged slaBreached = true
      const updatedOverdue = (await requestRepo.getById("req-overdue-1")).value;
      expect(updatedOverdue?.slaBreached).toBe(true);

      // Verify active ticket remains slaBreached = false
      const updatedActive = (await requestRepo.getById("req-active-2")).value;
      expect(updatedActive?.slaBreached).toBe(false);

      // Verify audit log entry was created for SLA breach
      const logs = (await auditRepo.getRecent()).value || [];
      const breachLog = logs.find(
        (l) => l.action === "SLA_BREACH_DETECTED" && l.entityId === "req-overdue-1"
      );
      expect(breachLog).toBeDefined();
      expect(breachLog?.details?.title).toBe("Не работает интерактивная доска");
    });

    it("ignores completed or cancelled tickets even if past deadline", async () => {
      const longAgo = new Date(Date.now() - 100 * 60 * 60 * 1000);
      const completedTicket: Request = {
        id: "req-completed-old",
        type: "CLEANING",
        title: "Влажная уборка",
        description: "Уборка завершена вовремя",
        status: "COMPLETED",
        priority: "LOW",
        creatorId: "teacher-1",
        createdAt: longAgo,
        updatedAt: longAgo,
        completedAt: new Date(longAgo.getTime() + 2 * 60 * 60 * 1000),
        slaDeadlineAt: new Date(longAgo.getTime() + 48 * 60 * 60 * 1000),
        slaBreached: false,
      };

      await requestRepo.save(completedTicket);

      const result = await slaWorker.tick();
      expect(result.isSuccess).toBe(true);

      const fetched = (await requestRepo.getById("req-completed-old")).value;
      expect(fetched?.slaBreached).toBe(false);
    });
  });
});
