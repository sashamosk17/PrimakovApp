import { Result } from "../../shared/Result";
import { Request, IRequestRepository } from "../../domain/repositories/IRequestRepository";

export class GetActiveRequestsUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(): Promise<Result<Request[]>> {
    return await this.requestRepository.getActive();
  }
}
