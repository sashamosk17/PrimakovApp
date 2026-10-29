import { Result } from "../../shared/Result";
import { Request, IRequestRepository } from "../../domain/repositories/IRequestRepository";

export class CreateRequestUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(request: Request): Promise<Result<void>> {
    return await this.requestRepository.save(request);
  }
}
