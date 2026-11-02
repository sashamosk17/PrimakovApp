import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { AdminGetDashboardStatsUseCase } from "../../application/admin/AdminGetDashboardStatsUseCase";
import { AdminGetUsersUseCase } from "../../application/admin/AdminGetUsersUseCase";
import { AdminCreateUserUseCase } from "../../application/admin/AdminCreateUserUseCase";
import { AdminUpdateUserStatusUseCase } from "../../application/admin/AdminUpdateUserStatusUseCase";
import { AdminDeleteUserUseCase } from "../../application/admin/AdminDeleteUserUseCase";
import { AdminBatchImportUsersUseCase } from "../../application/admin/AdminBatchImportUsersUseCase";
import { GetSubjectsUseCase } from "../../application/admin/GetSubjectsUseCase";
import { CreateSubjectUseCase } from "../../application/admin/CreateSubjectUseCase";
import { DeleteSubjectUseCase } from "../../application/admin/DeleteSubjectUseCase";
import { AssignTeacherSubjectUseCase } from "../../application/admin/AssignTeacherSubjectUseCase";
import { RemoveTeacherSubjectUseCase } from "../../application/admin/RemoveTeacherSubjectUseCase";
import { GetTeacherSubjectsUseCase } from "../../application/admin/GetTeacherSubjectsUseCase";
import { GetAllSchedulesAdminUseCase } from "../../application/admin/GetAllSchedulesAdminUseCase";
import { SubstituteTeacherUseCase } from "../../application/admin/SubstituteTeacherUseCase";
import { AddLessonToScheduleUseCase } from "../../application/admin/AddLessonToScheduleUseCase";
import { IRequestRepository, RequestStatus, RequestPriority } from "../../domain/repositories/IRequestRepository";
import { IRatingRepository } from "../../domain/repositories/IRatingRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IAnnouncementRepository } from "../../domain/repositories/IAnnouncementRepository";
import { ISubjectRepository } from "../../domain/repositories/ISubjectRepository";
import { IScheduleRepository } from "../../domain/repositories/IScheduleRepository";
import { MockSubjectRepository } from "../../infrastructure/database/memory/MockSubjectRepository";
import { MockScheduleRepository } from "../../infrastructure/database/memory/MockScheduleRepository";
import { Role } from "../../shared/types";

export class AdminController {
  private getDashboardStatsUseCase: AdminGetDashboardStatsUseCase;
  private getUsersUseCase: AdminGetUsersUseCase;
  private createUserUseCase: AdminCreateUserUseCase;
  private updateUserStatusUseCase: AdminUpdateUserStatusUseCase;
  private deleteUserUseCase: AdminDeleteUserUseCase;
  private batchImportUsersUseCase: AdminBatchImportUsersUseCase;

  // Sprint 1 (v0.4.0) Features
  private getSubjectsUseCase: GetSubjectsUseCase;
  private createSubjectUseCase: CreateSubjectUseCase;
  private deleteSubjectUseCase: DeleteSubjectUseCase;
  private assignTeacherSubjectUseCase: AssignTeacherSubjectUseCase;
  private removeTeacherSubjectUseCase: RemoveTeacherSubjectUseCase;
  private getTeacherSubjectsUseCase: GetTeacherSubjectsUseCase;
  private getAllSchedulesUseCase: GetAllSchedulesAdminUseCase;
  private substituteTeacherUseCase: SubstituteTeacherUseCase;
  private addLessonToScheduleUseCase: AddLessonToScheduleUseCase;

  private subjectRepo: ISubjectRepository;
  private scheduleRepo: IScheduleRepository;

  constructor(
    private readonly userRepo: IUserRepository,
    private readonly requestRepo: IRequestRepository,
    private readonly ratingRepo: IRatingRepository,
    private readonly announcementRepo?: IAnnouncementRepository,
    subjectRepository?: ISubjectRepository,
    scheduleRepository?: IScheduleRepository
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

    this.subjectRepo = subjectRepository || new MockSubjectRepository();
    this.scheduleRepo = scheduleRepository || new MockScheduleRepository();

    this.getSubjectsUseCase = new GetSubjectsUseCase(this.subjectRepo);
    this.createSubjectUseCase = new CreateSubjectUseCase(this.subjectRepo);
    this.deleteSubjectUseCase = new DeleteSubjectUseCase(this.subjectRepo);
    this.assignTeacherSubjectUseCase = new AssignTeacherSubjectUseCase(this.subjectRepo);
    this.removeTeacherSubjectUseCase = new RemoveTeacherSubjectUseCase(this.subjectRepo);
    this.getTeacherSubjectsUseCase = new GetTeacherSubjectsUseCase(this.subjectRepo);
    this.getAllSchedulesUseCase = new GetAllSchedulesAdminUseCase(this.scheduleRepo);
    this.substituteTeacherUseCase = new SubstituteTeacherUseCase(this.scheduleRepo);
    this.addLessonToScheduleUseCase = new AddLessonToScheduleUseCase(this.scheduleRepo);
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
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined;

      const result = await this.getUsersUseCase.execute({
        page,
        limit,
        search,
        role,
        isActive,
      });

      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      return res.status(200).json({ status: "success", data: result.value });
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.createUserUseCase.execute(req.body);
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.status(201).json({ status: "success", data: result.value });
    } catch (error) {
      next(error);
    }
  };

  updateUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          status: "error",
          error: { message: "isActive field must be a boolean" },
        });
      }

      const result = await this.updateUserStatusUseCase.execute(id, isActive);
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      return res.status(200).json({ status: "success", data: result.value });
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

  // --- Subjects & Teacher Assignment (Feature 3) ---

  getSubjects = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.getSubjectsUseCase.execute();
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.status(200).json({
        status: "success",
        data: result.value.map((s) => s.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  };

  createSubject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { name, description } = req.body;
      const result = await this.createSubjectUseCase.execute({ name, description });
      if (result.isFailure) {
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

  deleteSubject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.deleteSubjectUseCase.execute(id);
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.status(200).json({
        status: "success",
        message: "Subject deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getTeacherSubjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { teacherId } = req.params;
      const result = await this.getTeacherSubjectsUseCase.execute(teacherId);
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.status(200).json({
        status: "success",
        data: result.value.map((s) => s.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  };

  assignTeacherSubject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { teacherId } = req.params;
      const { subjectId } = req.body;
      const result = await this.assignTeacherSubjectUseCase.execute({ teacherId, subjectId });
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.status(200).json({
        status: "success",
        message: "Teacher assigned to subject successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  removeTeacherSubject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { teacherId, subjectId } = req.params;
      const result = await this.removeTeacherSubjectUseCase.execute({ teacherId, subjectId });
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.status(200).json({
        status: "success",
        message: "Assignment removed successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getAllTeacherAssignments = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.subjectRepo.getAllAssignments();
      if (result.isFailure) {
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

  // --- Schedules & Substitutions (Feature 3) ---

  getSchedules = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.getAllSchedulesUseCase.execute();
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      const data = (result.value || []).map((s) => ({
        id: s.id,
        groupId: s.groupId,
        date: s.date.toISOString().split("T")[0],
        lessons: s.lessons.map((l) => ({
          id: l.id,
          subject: l.subject,
          teacherId: l.teacherId,
          startTime: l.timeSlot.startTime,
          endTime: l.timeSlot.endTime,
          room: l.room.number,
          floor: l.floor,
          hasHomework: l.hasHomework,
          homeworkDescription: l.homeworkDescription,
        })),
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }));
      return res.status(200).json({ status: "success", data });
    } catch (error) {
      next(error);
    }
  };

  substituteTeacher = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id: lessonId } = req.params;
      const { newTeacherId, comment, scheduleId } = req.body;

      const result = await this.substituteTeacherUseCase.execute({
        scheduleId,
        lessonId,
        newTeacherId,
        comment,
      });

      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      const l = result.value;
      return res.status(200).json({
        status: "success",
        data: {
          id: l.id,
          subject: l.subject,
          teacherId: l.teacherId,
          startTime: l.timeSlot.startTime,
          endTime: l.timeSlot.endTime,
          room: l.room.number,
          homeworkDescription: l.homeworkDescription,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  addLesson = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.addLessonToScheduleUseCase.execute(req.body);
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      const l = result.value;
      return res.status(201).json({
        status: "success",
        data: {
          id: l.id,
          subject: l.subject,
          teacherId: l.teacherId,
          startTime: l.timeSlot.startTime,
          endTime: l.timeSlot.endTime,
          room: l.room.number,
          floor: l.floor,
          hasHomework: l.hasHomework,
          homeworkDescription: l.homeworkDescription,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
