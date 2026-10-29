import { DeadlineService } from "../../domain/services/DeadlineService";

export class GetUserDeadlinesUseCase {
  constructor(private readonly deadlineService: DeadlineService) {}

  public async execute(userId: string) {
    return this.deadlineService.getUserDeadlines(userId);
  }
}
