import { Result } from "../../shared/Result";
import { Request, IRequestRepository } from "../../domain/repositories/IRequestRepository";

export class GetAssignedRequestsUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(assigneeId: string): Promise<Result<Request[]>> {
    return await this.requestRepository.getByAssignee(assigneeId);
  }
}
