import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { IHouseRepository } from "../../domain/repositories/IHouseRepository";
import { GetHouseCupStandingsUseCase } from "../../application/house/GetHouseCupStandingsUseCase";
import { AwardHousePointsUseCase } from "../../application/house/AwardHousePointsUseCase";

export class HouseController {
  constructor(private readonly houseRepository: IHouseRepository) {}

  getStandings = async (_req: AuthenticatedRequest, res: Response) => {
    const useCase = new GetHouseCupStandingsUseCase(this.houseRepository);
    const result = await useCase.execute();

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: {
        standings: result.value.standings,
        recentTransactions: result.value.recentTransactions.map((t) => t.toJSON()),
      },
    });
  };

  awardPoints = async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.userId;
    if (!teacherId) {
      return res.status(401).json({
        status: "error",
        error: { message: "Unauthorized" },
      });
    }

    const { house, points, category, reason, studentId } = req.body;

    const useCase = new AwardHousePointsUseCase(this.houseRepository);
    const result = await useCase.execute({
      house,
      points,
      category,
      reason,
      awardedBy: teacherId,
      studentId,
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
}

