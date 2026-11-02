import { Schedule } from "../entities/Schedule";
import { Result } from "../../shared/Result";

export interface IScheduleRepository {
  getScheduleByGroup(groupId: string): Promise<Result<Schedule | null>>;
  getScheduleByDate(groupId: string, date: Date): Promise<Result<Schedule | null>>;
  getScheduleByUserId(userId: string, date: Date): Promise<Result<Schedule | null>>;
  findById(id: string): Promise<Schedule | undefined>;
  getAll(): Promise<Result<Schedule[]>>;
  save(schedule: Schedule): Promise<Result<void>>;
  update(schedule: Schedule): Promise<Result<void>>;
}
