import { IDeadlineRepository } from "../repositories/IDeadlineRepository";
import { Deadline } from "../entities/Deadline";
import { DeadlineStatus } from "../value-objects/DeadlineStatus";
import { Result } from "../../shared/Result";

export class DeadlineService {
  constructor(private readonly deadlineRepository: IDeadlineRepository) {}

  public async getUserDeadlines(userId: string): Promise<Result<Deadline[]>> {
    return this.deadlineRepository.getByUser(userId);
  }

  public async create(deadline: Deadline): Promise<Result<void>> {
    return this.deadlineRepository.save(deadline);
  }

  public async complete(deadline: Deadline): Promise<Result<void>> {
    return this.deadlineRepository.update(deadline);
  }

  public async toggleComplete(deadlineId: string): Promise<Result<Deadline>> {
    const deadline = await this.deadlineRepository.findById(deadlineId);
    if (!deadline) {
      return Result.fail("Deadline not found");
    }

    const toggleResult =
      deadline.status === DeadlineStatus.COMPLETED
        ? deadline.uncomplete()
        : deadline.complete();

    if (toggleResult.isFailure) {
      return Result.fail(toggleResult.error as string);
    }

    const updateResult = await this.deadlineRepository.update(deadline);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.error as string);
    }

    return Result.ok(deadline);
  }
}
