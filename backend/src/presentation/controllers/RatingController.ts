import { randomUUID } from "crypto";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { RateTeacherUseCase } from "../../application/rating/RateTeacherUseCase";
import { GetTeacherRatingsUseCase } from "../../application/rating/GetTeacherRatingsUseCase";
import { Rating } from "../../domain/entities/Rating";

export class RatingController {
  constructor(
    private readonly rateTeacherUseCase: RateTeacherUseCase,
    private readonly getTeacherRatingsUseCase: GetTeacherRatingsUseCase
  ) {}

  public rateTeacher = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || "";
      const { teacherId, rate, comment } = req.body;

      if (!teacherId || !rate) {
        return res.status(400).json({
          status: "error",
          error: { message: "teacherId and rate are required" }
        });
      }

      const rating = new Rating(
        randomUUID(),
        teacherId,
        userId,
        rate,
        new Date(),
        comment || ''
      );

      const result = await this.rateTeacherUseCase.execute(rating);

      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      return res.status(201).json({
        status: "success",
        data: {
          id: rating.id,
          teacherId: rating.teacherId,
          studentId: rating.userId,
          rate: rating.value,
          comment: rating.comment,
          createdAt: rating.createdAt.toISOString()
        }
      });
    } catch (error) {
      return next(error);
    }
  };

  public getRatings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { teacherId } = req.query;
      if (!teacherId || typeof teacherId !== 'string') {
        return res.status(400).json({ status: "error", error: { message: "teacherId is required" } });
      }

      const result = await this.getTeacherRatingsUseCase.execute(teacherId);

      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }

      // Проверяем, является ли пользователь админом
      const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "SUPERADMIN";

      // Map to Flutter-compatible format
      const ratings = result.value?.map(r => ({
        id: r.id,
        teacherId: r.teacherId,
        studentId: r.userId,
        rate: r.value,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
      })) || [];

      return res.json({ status: "success", data: ratings });
    } catch (error) {
      return next(error);
    }
  };
}
