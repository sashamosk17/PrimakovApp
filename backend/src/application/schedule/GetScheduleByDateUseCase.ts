import { ScheduleService } from "../../domain/services/ScheduleService";

export class GetScheduleByDateUseCase {
  constructor(private readonly scheduleService: ScheduleService) {}

  public async execute(groupId: string, date: Date) {
    return this.scheduleService.getScheduleByDate(groupId, date);
  }
}
