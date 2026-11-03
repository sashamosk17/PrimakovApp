import { IStoryRepository } from "../../domain/repositories/IStoryRepository";
import { Result } from "../../shared/Result";

export class DeleteStoryUseCase {
  constructor(private readonly storyRepository: IStoryRepository) {}

  public async execute(id: string): Promise<Result<void>> {
    if (!id || id.trim().length === 0) {
      return Result.fail("Story ID is required");
    }

    return this.storyRepository.delete(id);
  }
}

