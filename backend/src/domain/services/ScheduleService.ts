import { IScheduleRepository } from "../repositories/IScheduleRepository";
import { Result } from "../../shared/Result";
import { Schedule } from "../entities/Schedule";

export class ScheduleService {
  constructor(private readonly scheduleRepository: IScheduleRepository) {}

  public async getSchedule(groupId: string): Promise<Result<Schedule | null>> {
    return this.scheduleRepository.getScheduleByGroup(groupId);
  }

  public async getScheduleByDate(groupId: string, date: Date): Promise<Result<Schedule | null>> {
    return this.scheduleRepository.getScheduleByDate(groupId, date);
  }

  public async getScheduleByUserId(userId: string, date: Date): Promise<Result<Schedule | null>> {
    return this.scheduleRepository.getScheduleByUserId(userId, date);
  }
}
