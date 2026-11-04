import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { IAuditRepository } from "../../domain/repositories/IAuditRepository";

// Sanitize payload to strip sensitive credentials from audit logs
function sanitizeAuditPayload(body: any): any {
  if (!body || typeof body !== "object") return body;
  const clone = { ...body };
  const sensitiveKeys = ["password", "token", "refreshToken", "secret", "hash", "salt"];
  for (const key of Object.keys(clone)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      clone[key] = "********";
    }
  }
  return clone;
}

function resolveEntityFromPath(path: string): string {
  if (path.includes("/users")) return "USER";
  if (path.includes("/schedule") || path.includes("/lessons")) return "SCHEDULE";
  if (path.includes("/canteen")) return "CANTEEN";
  if (path.includes("/requests")) return "REQUEST";
  if (path.includes("/ratings")) return "RATING";
  if (path.includes("/announcements")) return "ANNOUNCEMENT";
  if (path.includes("/stories")) return "STORY";
  if (path.includes("/house")) return "HOUSE";
  if (path.includes("/boarding")) return "BOARDING";
  if (path.includes("/grades")) return "GRADE";
  if (path.includes("/deadlines")) return "DEADLINE";
  return "SYSTEM";
}

function resolveActionName(method: string, path: string): string {
  const entity = resolveEntityFromPath(path);
  const prefix = method.toUpperCase();
  if (prefix === "POST") return `CREATE_${entity}`;
  if (prefix === "PUT" || prefix === "PATCH") return `UPDATE_${entity}`;
  if (prefix === "DELETE") return `DELETE_${entity}`;
  return `${prefix}_${entity}`;
}

export const createAuditMiddleware = (auditRepository: IAuditRepository) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Only audit mutating actions
    if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
      return next();
    }

    // Capture request context
    const method = req.method;
    const path = req.path || req.originalUrl || "";
    const ipAddress =
      (req.headers?.["x-forwarded-for"] as string) || req.socket?.remoteAddress || req.ip || undefined;
    const sanitizedBody = sanitizeAuditPayload(req.body);

    res.on("finish", () => {
      // Record in background after response finishes
      try {
        const userId = req.user?.userId || null;
        const userEmail = req.user?.email || undefined;
        const entity = resolveEntityFromPath(path);
        const action = resolveActionName(method, path);
        const entityId = (req.params?.id as string) || req.body?.id || undefined;

        auditRepository.record({
          userId,
          userEmail,
          action: res.statusCode >= 400 ? `FAILED_${action}` : action,
          entity,
          entityId,
          details: {
            method,
            path,
            statusCode: res.statusCode,
            params: req.params,
            body: sanitizedBody,
          },
          ipAddress,
        }).catch((err) => {
          console.error("[AuditMiddleware] Failed to write audit record:", err);
        });
      } catch (err) {
        console.error("[AuditMiddleware] Unexpected audit error:", err);
      }
    });

    return next();
  };
};
