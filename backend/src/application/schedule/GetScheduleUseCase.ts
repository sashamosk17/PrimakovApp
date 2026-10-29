import { ScheduleService } from "../../domain/services/ScheduleService";

export class GetScheduleUseCase {
  constructor(private readonly scheduleService: ScheduleService) {}

  public async execute(groupId: string) {
    return this.scheduleService.getSchedule(groupId);
  }
}
