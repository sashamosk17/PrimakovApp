import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { IRequestRepository, RequestType } from "../../domain/repositories/IRequestRepository";
import { CreateRequestUseCase } from "../../application/request/CreateRequestUseCase";
import { GetUserRequestsUseCase } from "../../application/request/GetUserRequestsUseCase";
import { GetAssignedRequestsUseCase } from "../../application/request/GetAssignedRequestsUseCase";
import { UpdateRequestStatusUseCase } from "../../application/request/UpdateRequestStatusUseCase";
import { GetActiveRequestsUseCase } from "../../application/request/GetActiveRequestsUseCase";
import { GetRequestsByTypeUseCase } from "../../application/request/GetRequestsByTypeUseCase";

export class RequestController {
  constructor(private repository: IRequestRepository) {}

  create = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id || req.body.creatorId || "user-1";
    const requestData = {
      id: req.body.id || randomUUID(),
      type: req.body.type,
      title: req.body.title,
      description: req.body.description || "",
      status: req.body.status || "PENDING",
      priority: req.body.priority || "MEDIUM",
      creatorId: userId,
      assigneeId: req.body.assigneeId,
      roomId: req.body.roomId,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: req.body.notes,
    };

    const useCase = new CreateRequestUseCase(this.repository);
    const result = await useCase.execute(requestData);

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.status(201).json({
      status: "success",
      data: {
        ...requestData,
        message: "Request created successfully",
        createdAt: requestData.createdAt.toISOString(),
        updatedAt: requestData.updatedAt.toISOString(),
      },
    });
  };

  getUserRequests = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        error: { message: "Unauthorized" },
      });
    }

    const useCase = new GetUserRequestsUseCase(this.repository);
    const result = await useCase.execute(userId);

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: result.value,
    });
  };

  getAssignedRequests = async (req: Request, res: Response) => {
    const assigneeId = (req as any).user?.userId || (req as any).user?.id;

    if (!assigneeId) {
      return res.status(401).json({
        status: "error",
        error: { message: "Unauthorized" },
      });
    }

    const useCase = new GetAssignedRequestsUseCase(this.repository);
    const result = await useCase.execute(assigneeId);

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: result.value,
    });
  };

  updateStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const requestData = req.body;

    const useCase = new UpdateRequestStatusUseCase(this.repository);
    const result = await useCase.execute({ ...requestData, id });

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: { message: "Request updated successfully" },
    });
  };

  getActive = async (req: Request, res: Response) => {
    const useCase = new GetActiveRequestsUseCase(this.repository);
    const result = await useCase.execute();

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: result.value,
    });
  };

  getByType = async (req: Request, res: Response) => {
    const { type } = req.params;
    const requestType = type.toUpperCase() as RequestType;

    if (!["IT", "MAINTENANCE", "CLEANING"].includes(requestType)) {
      return res.status(400).json({
        status: "error",
        error: { message: "Invalid request type" },
      });
    }

    const useCase = new GetRequestsByTypeUseCase(this.repository);
    const result = await useCase.execute(requestType);

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: result.value,
    });
  };
}
