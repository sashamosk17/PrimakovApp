import { randomUUID } from "crypto";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { CreateDeadlineUseCase } from "../../application/deadline/CreateDeadlineUseCase";
import { GetUserDeadlinesUseCase } from "../../application/deadline/GetUserDeadlinesUseCase";
import { CompleteDeadlineUseCase } from "../../application/deadline/CompleteDeadlineUseCase";
import type { IDeadlineRepository } from "../../domain/repositories/IDeadlineRepository";
import { Deadline } from "../../domain/entities/Deadline";
import { DeadlineStatus } from "../../domain/value-objects/DeadlineStatus";

export class DeadlineController {
  constructor(
    private readonly createDeadlineUseCase: CreateDeadlineUseCase,
    private readonly getUserDeadlinesUseCase: GetUserDeadlinesUseCase,
    private readonly completeDeadlineUseCase: CompleteDeadlineUseCase,
    private readonly deadlineRepository: IDeadlineRepository
  ) {}

  public getDeadlines = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Получаем userId либо из токена, либо из query параметров
      const userId = req.user?.userId || (req.query.userId as string) || "user-1";
      const result = await this.getUserDeadlinesUseCase.execute(userId);
      return res.json({ status: "success", data: result.value });
    } catch (error) {
      return next(error);
    }
  };

  public createDeadline = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || (req.body.userId as string) || "user-1";
      const { title, description, dueDate, subject } = req.body;
      const deadline = new Deadline(
        randomUUID(),
        title,
        description,
        new Date(dueDate),
        userId,
        DeadlineStatus.PENDING,
        new Date(),
        undefined,
        undefined,
        subject
      );
      const result = await this.createDeadlineUseCase.execute(deadline);
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.status(201).json({ status: "success", data: deadline });
    } catch (error) {
      return next(error);
    }
  };

  public completeDeadline = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { deadlineId } = req.params;
      const result = await this.completeDeadlineUseCase.executeById(deadlineId);
      if (result.isFailure) {
        if (result.error === "Deadline not found") {
          return res.status(404).json({ status: "error", error: { message: "Deadline not found" } });
        }
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.json({ status: "success", data: result.value });
    } catch (error) {
      return next(error);
    }
  };
}
