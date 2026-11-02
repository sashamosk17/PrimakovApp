import { IScheduleRepository } from "../../domain/repositories/IScheduleRepository";
import { Schedule } from "../../domain/entities/Schedule";
import { Result } from "../../shared/Result";

export class GetAllSchedulesAdminUseCase {
  constructor(private readonly scheduleRepo: IScheduleRepository) {}

  async execute(): Promise<Result<Schedule[]>> {
    return this.scheduleRepo.getAll();
  }
}

