import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { GetTeachersUseCase } from "../../application/user/GetTeachersUseCase";
import { GetCurrentUserUseCase } from "../../application/user/GetCurrentUserUseCase";
import { UpdateProfileUseCase } from "../../application/user/UpdateProfileUseCase";
import { ChangePasswordUseCase } from "../../application/user/ChangePasswordUseCase";
import { GetUserSessionsUseCase } from "../../application/user/GetUserSessionsUseCase";
import { RevokeSessionUseCase } from "../../application/user/RevokeSessionUseCase";
import { GetNotificationSettingsUseCase } from "../../application/user/GetNotificationSettingsUseCase";
import { UpdateNotificationSettingsUseCase } from "../../application/user/UpdateNotificationSettingsUseCase";
import { GetUserStatsUseCase } from "../../application/user/GetUserStatsUseCase";
import { authMiddleware } from "../middleware/authMiddleware";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import type { ISessionRepository } from "../../domain/repositories/ISessionRepository";
import type { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { MockSessionRepository } from "../../infrastructure/database/memory/MockSessionRepository";
import { MockNotificationPreferencesRepository } from "../../infrastructure/database/memory/MockNotificationPreferencesRepository";

export const userRoutes = (
  repository: IUserRepository,
  sessionRepository?: ISessionRepository,
  notificationRepository?: INotificationRepository
) => {
  const router = Router();
  const sessionRepo = sessionRepository || new MockSessionRepository();
  const notifRepo = notificationRepository || new MockNotificationPreferencesRepository();

  const controller = new UserController(
    new GetTeachersUseCase(repository),
    new GetCurrentUserUseCase(repository),
    new UpdateProfileUseCase(repository),
    new ChangePasswordUseCase(repository),
    new GetUserSessionsUseCase(sessionRepo),
    new RevokeSessionUseCase(sessionRepo),
    new GetNotificationSettingsUseCase(notifRepo),
    new UpdateNotificationSettingsUseCase(notifRepo),
    new GetUserStatsUseCase()
  );

  // Публичный — список учителей для рейтингов
  router.get("/teachers", controller.getTeachers);

  // Защищённые — работа с профилем текущего пользователя
  router.get("/me",                        authMiddleware, controller.getMe);
  router.put("/me",                        authMiddleware, controller.updateProfile);
  router.put("/me/password",                 authMiddleware, controller.changePassword);
  router.get("/me/sessions",                 authMiddleware, controller.getSessions);
  router.delete("/me/sessions/:sessionId",   authMiddleware, controller.revokeSession);
  router.get("/me/notifications",            authMiddleware, controller.getNotificationSettings);
  router.put("/me/notifications",            authMiddleware, controller.updateNotificationSettings);
  router.get("/me/stats",                    authMiddleware, controller.getStats);

  return router;
};
