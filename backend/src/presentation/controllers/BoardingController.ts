import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { IBoardingRepository } from "../../domain/repositories/IBoardingRepository";
import { BoardingCheckInUseCase } from "../../application/boarding/BoardingCheckInUseCase";
import { GetStudentBoardingStatusUseCase } from "../../application/boarding/GetStudentBoardingStatusUseCase";
import { CreateWeekendLeaveRequestUseCase } from "../../application/boarding/CreateWeekendLeaveRequestUseCase";
import { GetBoardingRosterUseCase } from "../../application/boarding/GetBoardingRosterUseCase";
import { UpdateLeaveRequestStatusUseCase } from "../../application/boarding/UpdateLeaveRequestStatusUseCase";

export class BoardingController {
  constructor(private readonly boardingRepository: IBoardingRepository) {}

  checkIn = async (req: AuthenticatedRequest, res: Response) => {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({
        status: "error",
        error: { message: "Unauthorized" },
      });
    }

    const { notes, latitude, longitude } = req.body;
    const useCase = new BoardingCheckInUseCase(this.boardingRepository);
    const result = await useCase.execute({
      studentId,
      notes,
      latitude,
      longitude,
    });

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: result.value.toJSON(),
    });
  };

  getMyStatus = async (req: AuthenticatedRequest, res: Response) => {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({
        status: "error",
        error: { message: "Unauthorized" },
      });
    }

    const useCase = new GetStudentBoardingStatusUseCase(this.boardingRepository);
    const result = await useCase.execute({ studentId });

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: {
        lastCheckIn: result.value.lastCheckIn?.toJSON() || null,
        activeLeave: result.value.activeLeave?.toJSON() || null,
        recentCheckIns: (result.value.recentCheckIns || []).map((c) => c.toJSON()),
      },
    });
  };

  createLeaveRequest = async (req: AuthenticatedRequest, res: Response) => {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({
        status: "error",
        error: { message: "Unauthorized" },
      });
    }

    const { departureDate, returnDate, transportType, guardianConfirmed } = req.body;
    const useCase = new CreateWeekendLeaveRequestUseCase(this.boardingRepository);
    const result = await useCase.execute({
      studentId,
      departureDate,
      returnDate,
      transportType,
      guardianConfirmed,
    });

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: result.value.toJSON(),
    });
  };

  getRoster = async (_req: AuthenticatedRequest, res: Response) => {
    const useCase = new GetBoardingRosterUseCase(this.boardingRepository);
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

  getLeaveRequests = async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const requests = await this.boardingRepository.getLeaveRequests();
      return res.json({
        status: "success",
        data: requests.map((r) => r.toJSON()),
      });
    } catch (error: any) {
      return res.status(400).json({
        status: "error",
        error: { message: error.message || "Failed to load leave requests" },
      });
    }
  };

  updateLeaveRequestStatus = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const useCase = new UpdateLeaveRequestStatusUseCase(this.boardingRepository);
    const result = await useCase.execute({
      requestId: id,
      status,
    });

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      message: `Leave request ${status.toLowerCase()} successfully`,
    });
  };
}

