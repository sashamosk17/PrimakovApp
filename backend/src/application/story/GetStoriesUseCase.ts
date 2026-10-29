import { IStoryRepository } from "../../domain/repositories/IStoryRepository";
import { Story } from "../../domain/entities/Story";
import { Result } from "../../shared/Result";

export class GetStoriesUseCase {
  constructor(private readonly storyRepository: IStoryRepository) {}

  public async execute(): Promise<Result<Story[]>> {
    const result = await this.storyRepository.getAll();
    return result;
  }
}
