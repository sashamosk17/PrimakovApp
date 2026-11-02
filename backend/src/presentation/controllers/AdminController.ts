import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { AdminGetDashboardStatsUseCase } from "../../application/admin/AdminGetDashboardStatsUseCase";
import { AdminGetUsersUseCase } from "../../application/admin/AdminGetUsersUseCase";
import { AdminCreateUserUseCase } from "../../application/admin/AdminCreateUserUseCase";
import { AdminUpdateUserStatusUseCase } from "../../application/admin/AdminUpdateUserStatusUseCase";
import { AdminDeleteUserUseCase } from "../../application/admin/AdminDeleteUserUseCase";
import { AdminBatchImportUsersUseCase } from "../../application/admin/AdminBatchImportUsersUseCase";
import { IRequestRepository, RequestStatus, RequestPriority } from "../../domain/repositories/IRequestRepository";
import { IRatingRepository } from "../../domain/repositories/IRatingRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IAnnouncementRepository } from "../../domain/repositories/IAnnouncementRepository";
import { Role } from "../../shared/types";

export class AdminController {
  private getDashboardStatsUseCase: AdminGetDashboardStatsUseCase;
  private getUsersUseCase: AdminGetUsersUseCase;
  private createUserUseCase: AdminCreateUserUseCase;
  private updateUserStatusUseCase: AdminUpdateUserStatusUseCase;
  private deleteUserUseCase: AdminDeleteUserUseCase;
  private batchImportUsersUseCase: AdminBatchImportUsersUseCase;

  constructor(
    private readonly userRepo: IUserRepository,
    private readonly requestRepo: IRequestRepository,
    private readonly ratingRepo: IRatingRepository,
    private readonly announcementRepo?: IAnnouncementRepository
  ) {
    this.getDashboardStatsUseCase = new AdminGetDashboardStatsUseCase(
      userRepo,
      requestRepo,
      ratingRepo,
      announcementRepo
    );
    this.getUsersUseCase = new AdminGetUsersUseCase(userRepo);
    this.createUserUseCase = new AdminCreateUserUseCase(userRepo);
    this.updateUserStatusUseCase = new AdminUpdateUserStatusUseCase(userRepo);
    this.deleteUserUseCase = new AdminDeleteUserUseCase(userRepo);
    this.batchImportUsersUseCase = new AdminBatchImportUsersUseCase(userRepo);
  }

  getDashboard = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.getDashboardStatsUseCase.execute();
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.status(200).json({ status: "success", data: result.value });
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const search = req.query.search as string | undefined;
      const role = req.query.role as Role | undefined;
      const isActive =
        req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;

      const result = await this.getUsersUseCase.execute({
        page,
        limit,
        search,
        role,
        isActive,
      });

      if (result.isFailure || !result.value) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      return res.status(200).json({
        status: "success",
        data: {
          users: result.value.users.map((u) => u.toJSON()),
          total: result.value.total,
          page: result.value.page,
          limit: result.value.limit,
          totalPages: result.value.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName, role, isActive } = req.body;
      const result = await this.createUserUseCase.execute({
        email,
        password,
        firstName,
        lastName,
        role,
        isActive,
      });

      if (result.isFailure || !result.value) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      return res.status(201).json({
        status: "success",
        data: result.value.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const result = await this.updateUserStatusUseCase.execute(id, Boolean(isActive));
      if (result.isFailure || !result.value) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      return res.status(200).json({
        status: "success",
        data: result.value.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.deleteUserUseCase.execute(id);
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      return res.status(200).json({
        status: "success",
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  importUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { users } = req.body;
      if (!Array.isArray(users)) {
        return res.status(400).json({
          status: "error",
          error: { message: "Invalid payload: users must be an array" },
        });
      }

      const result = await this.batchImportUsersUseCase.execute(users);
      if (result.isFailure || !result.value) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      return res.status(200).json({
        status: "success",
        data: result.value,
      });
    } catch (error) {
      next(error);
    }
  };

  getRequests = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      let requests: any[] = [];
      if (this.requestRepo.getAll) {
        const allRes = await this.requestRepo.getAll();
        requests = allRes.value || [];
      } else {
        const activeRes = await this.requestRepo.getActive();
        requests = activeRes.value || [];
      }

      return res.status(200).json({
        status: "success",
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  };

  updateRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status, assigneeId, notes, priority } = req.body;

      const existing = await this.requestRepo.getById(id);
      if (existing.isFailure || !existing.value) {
        return res.status(404).json({
          status: "error",
          error: { message: "Request not found" },
        });
      }

      const updatedRequest = {
        ...existing.value,
        status: status ? (status as RequestStatus) : existing.value.status,
        assigneeId: assigneeId !== undefined ? assigneeId : existing.value.assigneeId,
        notes: notes !== undefined ? notes : existing.value.notes,
        priority: priority ? (priority as RequestPriority) : existing.value.priority,
        updatedAt: new Date(),
        completedAt: status === "COMPLETED" ? new Date() : existing.value.completedAt,
      };

      const saveRes = await this.requestRepo.update(updatedRequest);
      if (saveRes.isFailure) {
        return res.status(400).json({
          status: "error",
          error: { message: saveRes.error },
        });
      }

      return res.status(200).json({
        status: "success",
        data: updatedRequest,
      });
    } catch (error) {
      next(error);
    }
  };

  getRatings = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      let ratings: any[] = [];
      if (this.ratingRepo.getAll) {
        const result = await this.ratingRepo.getAll();
        ratings = (result.value || []).map((r) => r.toJSON());
      }

      return res.status(200).json({
        status: "success",
        data: ratings,
      });
    } catch (error) {
      next(error);
    }
  };
}

