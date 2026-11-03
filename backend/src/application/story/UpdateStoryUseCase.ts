import { Story } from "../../domain/entities/Story";
import { IStoryRepository } from "../../domain/repositories/IStoryRepository";
import { Result } from "../../shared/Result";

export interface UpdateStoryDTO {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  linkText?: string;
  expiresInDays?: number;
}

export class UpdateStoryUseCase {
  constructor(private readonly storyRepository: IStoryRepository) {}

  public async execute(dto: UpdateStoryDTO): Promise<Result<Story>> {
    if (!dto.id) {
      return Result.fail("Story ID is required");
    }

    const existingResult = await this.storyRepository.getById(dto.id);
    if (existingResult.isFailure || !existingResult.value) {
      return Result.fail(`Story with ID ${dto.id} not found`);
    }

    const story = existingResult.value;

    if (dto.title !== undefined) {
      if (dto.title.trim().length === 0) {
        return Result.fail("Title cannot be empty");
      }
      story.title = dto.title.trim();
    }

    if (dto.description !== undefined) {
      if (dto.description.trim().length === 0) {
        return Result.fail("Description cannot be empty");
      }
      story.description = dto.description.trim();
    }

    if (dto.imageUrl !== undefined) {
      story.imageUrl = dto.imageUrl.trim() || undefined;
    }

    if (dto.videoUrl !== undefined) {
      story.videoUrl = dto.videoUrl.trim() || undefined;
    }

    if (dto.linkUrl !== undefined) {
      story.linkUrl = dto.linkUrl.trim() || undefined;
    }

    if (dto.linkText !== undefined) {
      story.linkText = dto.linkText.trim() || undefined;
    }

    if (dto.expiresInDays && dto.expiresInDays > 0) {
      story.expiresAt = new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000);
    }

    const saveResult = await this.storyRepository.save(story);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.error || "Failed to update story");
    }

    return Result.ok(story);
  }
}

