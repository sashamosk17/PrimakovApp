import { Schedule } from "../entities/Schedule";
import { Result } from "../../shared/Result";

export interface IScheduleRepository {
  getScheduleByGroup(groupId: string): Promise<Result<Schedule | null>>;
  getScheduleByDate(groupId: string, date: Date): Promise<Result<Schedule | null>>;
  getScheduleByUserId(userId: string, date: Date): Promise<Result<Schedule | null>>;
  save(schedule: Schedule): Promise<Result<void>>;
}
