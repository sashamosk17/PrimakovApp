import { Result } from "../../shared/Result";
import { Request, IRequestRepository } from "../../domain/repositories/IRequestRepository";

export class GetUserRequestsUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(userId: string): Promise<Result<Request[]>> {
    return await this.requestRepository.getByCreator(userId);
  }
}
