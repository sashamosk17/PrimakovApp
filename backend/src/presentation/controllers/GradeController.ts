import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { IGradeRepository } from "../../domain/repositories/IGradeRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { GetStudentGradesUseCase } from "../../application/grades/GetStudentGradesUseCase";
import { AdminImportMeshGradesUseCase } from "../../application/grades/AdminImportMeshGradesUseCase";

export class GradeController {
  constructor(
    private readonly gradeRepository: IGradeRepository,
    private readonly userRepository: IUserRepository
  ) {}

  getMyGrades = async (req: AuthenticatedRequest, res: Response) => {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({
        status: "error",
        error: { message: "Unauthorized" },
      });
    }

    const period = req.query.period as string | undefined;

    const useCase = new GetStudentGradesUseCase(this.gradeRepository);
    const result = await useCase.execute({ studentId, period });

    if (result.isFailure) {
      return res.status(400).json({
        status: "error",
        error: { message: result.error },
      });
    }

    return res.json({
      status: "success",
      data: result.value.map((s) => s.toJSON()),
    });
  };

  importMeshGrades = async (req: AuthenticatedRequest, res: Response) => {
    const { csvData, defaultPeriod, classFilter } = req.body;

    const useCase = new AdminImportMeshGradesUseCase(
      this.gradeRepository,
      this.userRepository
    );

    const result = await useCase.execute({
      csvData,
      defaultPeriod,
      classFilter,
    });

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

