import { randomUUID } from "crypto";
import { Story } from "../../domain/entities/Story";
import { IStoryRepository } from "../../domain/repositories/IStoryRepository";
import { Result } from "../../shared/Result";

export interface CreateStoryDTO {
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  author?: string;
  expiresInDays?: number;
  linkUrl?: string;
  linkText?: string;
}

export class CreateStoryUseCase {
  constructor(private readonly storyRepository: IStoryRepository) {}

  public async execute(dto: CreateStoryDTO): Promise<Result<Story>> {
    if (!dto.title || dto.title.trim().length === 0) {
      return Result.fail("Title is required");
    }

    if (!dto.description || dto.description.trim().length === 0) {
      return Result.fail("Description is required");
    }

    const now = new Date();
    const days = dto.expiresInDays && dto.expiresInDays > 0 ? dto.expiresInDays : 7;
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const story: Story = {
      id: randomUUID(),
      title: dto.title.trim(),
      description: dto.description.trim(),
      imageUrl: dto.imageUrl?.trim() || undefined,
      videoUrl: dto.videoUrl?.trim() || undefined,
      author: dto.author?.trim() || "admin",
      createdAt: now,
      expiresAt,
      viewedBy: [],
      linkUrl: dto.linkUrl?.trim() || undefined,
      linkText: dto.linkText?.trim() || undefined,
    };

    const saveResult = await this.storyRepository.save(story);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.error || "Failed to save story");
    }

    return Result.ok(story);
  }
}

