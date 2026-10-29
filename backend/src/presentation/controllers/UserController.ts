import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { GetTeachersUseCase } from "../../application/user/GetTeachersUseCase";
import { GetCurrentUserUseCase } from "../../application/user/GetCurrentUserUseCase";
import { UpdateProfileUseCase } from "../../application/user/UpdateProfileUseCase";
import { ChangePasswordUseCase } from "../../application/user/ChangePasswordUseCase";
import { GetUserSessionsUseCase } from "../../application/user/GetUserSessionsUseCase";
import { RevokeSessionUseCase } from "../../application/user/RevokeSessionUseCase";
import { GetNotificationSettingsUseCase } from "../../application/user/GetNotificationSettingsUseCase";
import { UpdateNotificationSettingsUseCase } from "../../application/user/UpdateNotificationSettingsUseCase";
import { GetUserStatsUseCase } from "../../application/user/GetUserStatsUseCase";

export class UserController {
  constructor(
    private readonly getTeachersUseCase: GetTeachersUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly getUserSessionsUseCase?: GetUserSessionsUseCase,
    private readonly revokeSessionUseCase?: RevokeSessionUseCase,
    private readonly getNotificationSettingsUseCase?: GetNotificationSettingsUseCase,
    private readonly updateNotificationSettingsUseCase?: UpdateNotificationSettingsUseCase,
    private readonly getUserStatsUseCase?: GetUserStatsUseCase
  ) {}

  public getTeachers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.getTeachersUseCase.execute();

      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      const teachers = result.value?.map(teacher => ({
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        fullName: `${teacher.lastName} ${teacher.firstName}`,
      })) || [];

      return res.json({ status: "success", data: teachers });
    } catch (error) {
      return next(error);
    }
  };

  // --- GET /api/users/me ---
  public getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await this.getCurrentUserUseCase.execute(userId);

      if (result.isFailure) {
        return res.status(404).json({
          status: "error",
          error: { message: result.error }
        });
      }

      return res.json({
        status: "success",
        data: result.value.toJSON()
      });
    } catch (error) {
      return next(error);
    }
  };

  // --- PUT /api/users/me ---
  public updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { firstName, lastName, avatarUrl, twoFactorEnabled } = req.body;

      const result = await this.updateProfileUseCase.execute({
        userId,
        firstName,
        lastName,
        avatarUrl,
        twoFactorEnabled,
      });

      if (result.isFailure) {
        return res.status(400).json({
          status: "error",
          error: { message: result.error }
        });
      }

      return res.json({
        status: "success",
        data: result.value.toJSON()
      });
    } catch (error) {
      return next(error);
    }
  };

  // --- PUT /api/users/me/password ---
  public changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          status: "error",
          error: { message: "currentPassword and newPassword are required" }
        });
      }

      const result = await this.changePasswordUseCase.execute({
        userId,
        currentPassword,
        newPassword,
      });

      if (result.isFailure) {
        return res.status(400).json({
          status: "error",
          error: { message: result.error }
        });
      }

      return res.json({
        status: "success",
        data: { message: "Password changed successfully" }
      });
    } catch (error) {
      return next(error);
    }
  };

  // --- GET /api/users/me/sessions ---
  public getSessions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!this.getUserSessionsUseCase) {
        return res.json({ status: "success", data: [] });
      }

      const userId = req.user!.userId;
      const result = await this.getUserSessionsUseCase.execute(userId);

      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      return res.json({
        status: "success",
        data: result.value?.map(s => s.toJSON()) || []
      });
    } catch (error) {
      return next(error);
    }
  };

  // --- DELETE /api/users/me/sessions/:sessionId ---
  public revokeSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!this.revokeSessionUseCase) {
        return res.status(400).json({ status: "error", error: { message: "Sessions not supported" } });
      }

      const userId = req.user!.userId;
      const sessionId = req.params.sessionId;

      const result = await this.revokeSessionUseCase.execute(userId, sessionId);

      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      return res.json({
        status: "success",
        data: { message: "Session revoked successfully" }
      });
    } catch (error) {
      return next(error);
    }
  };

  // --- GET /api/users/me/notifications ---
  public getNotificationSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!this.getNotificationSettingsUseCase) {
        return res.json({
          status: "success",
          data: {
            pushEnabled: true,
            deadlineNotifications: true,
            scheduleNotifications: true,
            announcementNotifications: true
          }
        });
      }

      const userId = req.user!.userId;
      const result = await this.getNotificationSettingsUseCase.execute(userId);

      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      return res.json({
        status: "success",
        data: result.value?.toJSON()
      });
    } catch (error) {
      return next(error);
    }
  };

  // --- PUT /api/users/me/notifications ---
  public updateNotificationSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!this.updateNotificationSettingsUseCase) {
        return res.json({ status: "success", data: req.body });
      }

      const userId = req.user!.userId;
      const { pushEnabled, deadlineNotifications, scheduleNotifications, announcementNotifications } = req.body;

      const result = await this.updateNotificationSettingsUseCase.execute({
        userId,
        pushEnabled,
        deadlineNotifications,
        scheduleNotifications,
        announcementNotifications
      });

      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      return res.json({
        status: "success",
        data: result.value?.toJSON()
      });
    } catch (error) {
      return next(error);
    }
  };

  // --- GET /api/users/me/stats ---
  public getStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!this.getUserStatsUseCase) {
        return res.json({
          status: "success",
          data: {
            gpa: 4.85,
            attendanceRate: 98.0,
            totalLessons: 32,
            completedDeadlines: 0,
            pendingDeadlines: 0
          }
        });
      }

      const userId = req.user!.userId;
      const result = await this.getUserStatsUseCase.execute(userId);

      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      return res.json({
        status: "success",
        data: result.value?.toJSON()
      });
    } catch (error) {
      return next(error);
    }
  };
}
