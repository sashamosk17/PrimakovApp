import { ScheduleService } from "../../domain/services/ScheduleService";

export class GetScheduleByUserIdUseCase {
  constructor(private readonly scheduleService: ScheduleService) {}

  public async execute(userId: string, date: Date) {
    return this.scheduleService.getScheduleByUserId(userId, date);
  }
}
