import { IAnnouncementRepository } from "../../domain/repositories/IAnnouncementRepository";
import { Announcement } from "../../domain/entities/Announcement";
import { Result } from "../../shared/Result";
import { randomUUID } from "crypto";

export interface CreateAnnouncementInput {
  title: string;
  category: string;
  content: string;
  description?: string;
  authorId: string;
  imageUrl?: string;
}

export class CreateAnnouncementUseCase {
  constructor(private readonly announcementRepo: IAnnouncementRepository) {}

  async execute(input: CreateAnnouncementInput): Promise<Result<Announcement>> {
    if (!input.title || input.title.trim() === "") {
      return Result.fail("Announcement title is required");
    }
    if (!input.category || input.category.trim() === "") {
      return Result.fail("Announcement category is required");
    }

    const announcement: Announcement = {
      id: randomUUID(),
      title: input.title.trim(),
      category: input.category.trim(),
      content: input.content,
      description: input.description || input.content.slice(0, 150),
      date: new Date(),
      createdAt: new Date(),
      authorId: input.authorId,
      imageUrl: input.imageUrl,
    };

    const saveRes = await this.announcementRepo.save(announcement);
    if (saveRes.isFailure) {
      return Result.fail(saveRes.error || "Failed to save announcement");
    }

    return Result.ok(announcement);
  }
}
