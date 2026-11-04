import { RequestPriority, RequestType } from "../repositories/IRequestRepository";

export interface DepartmentRouting {
  department: string;
  suggestedAssigneeRole: string;
  defaultAssigneeEmail: string;
}

export class TicketAutoRouter {
  /**
   * Calculates SLA deadline based on priority:
   * - URGENT: 2 hours (120 mins)
   * - HIGH: 4 hours (240 mins)
   * - MEDIUM: 24 hours (1440 mins)
   * - LOW: 48 hours (2880 mins)
   */
  public static calculateSlaDeadline(createdAt: Date, priority: RequestPriority): Date {
    const createdTime = new Date(createdAt).getTime();
    let durationMinutes = 24 * 60;

    switch (priority) {
      case "URGENT":
        durationMinutes = 2 * 60;
        break;
      case "HIGH":
        durationMinutes = 4 * 60;
        break;
      case "MEDIUM":
        durationMinutes = 24 * 60;
        break;
      case "LOW":
        durationMinutes = 48 * 60;
        break;
    }

    return new Date(createdTime + durationMinutes * 60 * 1000);
  }

  /**
   * Determines department routing for ticket based on type.
   */
  public static determineRouting(type: RequestType, title = "", description = ""): DepartmentRouting {
    switch (type) {
      case "IT":
        return {
          department: "IT-служба",
          suggestedAssigneeRole: "ADMIN",
          defaultAssigneeEmail: "it-support@primakov.school",
        };
      case "CLEANING":
        return {
          department: "Служба клининга",
          suggestedAssigneeRole: "STAFF",
          defaultAssigneeEmail: "cleaning@primakov.school",
        };
      case "MAINTENANCE":
      default:
        return {
          department: "Инженерная служба",
          suggestedAssigneeRole: "STAFF",
          defaultAssigneeEmail: "maintenance@primakov.school",
        };
    }
  }
}

