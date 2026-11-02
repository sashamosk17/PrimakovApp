import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { AdminController } from "../controllers/AdminController";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IRequestRepository } from "../../domain/repositories/IRequestRepository";
import { IRatingRepository } from "../../domain/repositories/IRatingRepository";
import { IAnnouncementRepository } from "../../domain/repositories/IAnnouncementRepository";
import { ISubjectRepository } from "../../domain/repositories/ISubjectRepository";
import { IScheduleRepository } from "../../domain/repositories/IScheduleRepository";
import { ICanteenMenuRepository } from "../../domain/repositories/ICanteenMenuRepository";
import { authMiddleware } from "../middleware/authMiddleware";
import { validate } from "../middleware/validationMiddleware";
import { AuthenticatedRequest } from "../types";
import { AuthorizationError } from "../../shared/errors/AuthorizationError";

export interface AdminRoutesDependencies {
  userRepository: IUserRepository;
  requestRepository: IRequestRepository;
  ratingRepository: IRatingRepository;
  announcementRepository?: IAnnouncementRepository;
  subjectRepository?: ISubjectRepository;
  scheduleRepository?: IScheduleRepository;
  canteenMenuRepository?: ICanteenMenuRepository;
}

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN", "SUPERADMIN"]),
  isActive: z.boolean().optional(),
});

const CreateSubjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const AssignTeacherSubjectSchema = z.object({
  subjectId: z.string().uuid(),
});

const SubstituteTeacherSchema = z.object({
  newTeacherId: z.string().min(1),
  comment: z.string().optional(),
  scheduleId: z.string().optional(),
});

const AddLessonSchema = z.object({
  scheduleId: z.string().min(1),
  subject: z.string().min(1),
  teacherId: z.string().min(1),
  startTime: z.string().min(3),
  endTime: z.string().min(3),
  roomNumber: z.string().min(1),
  building: z.string().optional(),
  floor: z.number().optional(),
  hasHomework: z.boolean().optional(),
  homeworkDescription: z.string().optional(),
});

const CreateCanteenMenuSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  isActive: z.boolean().optional(),
});

const AddCanteenMenuItemSchema = z.object({
  menuId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  weight: z.number().optional(),
  price: z.number().optional(),
  imageUrl: z.string().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  allergens: z.array(z.string()).optional(),
  displayOrder: z.number().optional(),
});

const UpdateCanteenMenuItemSchema = z.object({
  menuId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  weight: z.number().optional(),
  price: z.number().optional(),
  imageUrl: z.string().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  allergens: z.array(z.string()).optional(),
  displayOrder: z.number().optional(),
});

const CopyWeekMenuSchema = z.object({
  fromWeekStart: z.string().min(1),
  toWeekStart: z.string().min(1),
});

export function adminRoutes(deps: AdminRoutesDependencies): Router {
  const router = Router();
  const controller = new AdminController(
    deps.userRepository,
    deps.requestRepository,
    deps.ratingRepository,
    deps.announcementRepository,
    deps.subjectRepository,
    deps.scheduleRepository,
    deps.canteenMenuRepository
  );

  // 1. Must be authenticated
  router.use(authMiddleware);

  // 2. Must have ADMIN or SUPERADMIN role
  router.use((req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN")) {
      return next(new AuthorizationError("Admin access required"));
    }
    next();
  });

  // Dashboard Overview
  router.get("/dashboard", controller.getDashboard);

  // Users Management
  router.get("/users", controller.getUsers);
  router.post("/users", validate(CreateUserSchema), controller.createUser);
  router.patch("/users/:id/status", controller.updateUserStatus);
  router.delete("/users/:id", controller.deleteUser);
  router.post("/users/import", controller.importUsers);

  // Service Requests
  router.get("/requests", controller.getRequests);
  router.patch("/requests/:id", controller.updateRequest);

  // Ratings Moderation
  router.get("/ratings", controller.getRatings);

  // Subjects Management (Sprint 1 - Feature 3)
  router.get("/subjects", controller.getSubjects);
  router.post("/subjects", validate(CreateSubjectSchema), controller.createSubject);
  router.delete("/subjects/:id", controller.deleteSubject);

  // Teacher-Subject Assignments (Sprint 1 - Feature 3)
  router.get("/teachers/:teacherId/subjects", controller.getTeacherSubjects);
  router.post(
    "/teachers/:teacherId/subjects",
    validate(AssignTeacherSubjectSchema),
    controller.assignTeacherSubject
  );
  router.delete("/teachers/:teacherId/subjects/:subjectId", controller.removeTeacherSubject);
  router.get("/teacher-assignments", controller.getAllTeacherAssignments);

  // Schedules & Substitutions Management (Sprint 1 - Feature 3)
  router.get("/schedules", controller.getSchedules);
  router.patch(
    "/schedules/lessons/:id/substitute",
    validate(SubstituteTeacherSchema),
    controller.substituteTeacher
  );
  router.post("/schedules/lessons", validate(AddLessonSchema), controller.addLesson);

  // Canteen Menu Management (Sprint 2 - ADM-01)
  router.get("/canteen/menu/:date", controller.getCanteenMenuByDate);
  router.post(
    "/canteen/menu",
    validate(CreateCanteenMenuSchema),
    controller.createOrUpdateCanteenMenu
  );
  router.post("/canteen/items", validate(AddCanteenMenuItemSchema), controller.addCanteenMenuItem);
  router.put(
    "/canteen/items/:id",
    validate(UpdateCanteenMenuItemSchema),
    controller.updateCanteenMenuItem
  );
  router.delete("/canteen/items/:id", controller.deleteCanteenMenuItem);
  router.post("/canteen/copy-week", validate(CopyWeekMenuSchema), controller.copyWeekCanteenMenu);

  return router;
}
