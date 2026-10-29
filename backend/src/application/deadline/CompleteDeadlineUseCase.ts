import { DeadlineService } from "../../domain/services/DeadlineService";
import { Deadline } from "../../domain/entities/Deadline";
import { Result } from "../../shared/Result";

export class CompleteDeadlineUseCase {
  constructor(private readonly deadlineService: DeadlineService) {}

  public async execute(deadline: Deadline): Promise<Result<void>> {
    return this.deadlineService.complete(deadline);
  }

  public async executeById(deadlineId: string): Promise<Result<Deadline>> {
    return this.deadlineService.toggleComplete(deadlineId);
  }
}
