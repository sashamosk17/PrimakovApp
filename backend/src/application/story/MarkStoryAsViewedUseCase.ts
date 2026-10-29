import { IStoryRepository } from "../../domain/repositories/IStoryRepository";
import { Result } from "../../shared/Result";

export class MarkStoryAsViewedUseCase {
  constructor(private readonly storyRepository: IStoryRepository) {}

  public async execute(storyId: string, userId: string): Promise<Result<void>> {
    const storyResult = await this.storyRepository.getById(storyId);
    if (!storyResult.isSuccess || !storyResult.value) {
      return Result.fail("Story not found");
    }

    return this.storyRepository.markAsViewed(storyId, userId);
  }
}
