import { Result } from "../../shared/Result";
import { Request, RequestType, IRequestRepository } from "../../domain/repositories/IRequestRepository";

export class GetRequestsByTypeUseCase {
  constructor(private requestRepository: IRequestRepository) {}

  async execute(type: RequestType): Promise<Result<Request[]>> {
    return await this.requestRepository.getByType(type);
  }
}
