import { IAnnouncementRepository } from "../../domain/repositories/IAnnouncementRepository";
import { Announcement } from "../../domain/entities/Announcement";
import { Result } from "../../shared/Result";

export interface UpdateAnnouncementInput {
  id: string;
  title?: string;
  category?: string;
  content?: string;
  description?: string;
  imageUrl?: string;
}

export class UpdateAnnouncementUseCase {
  constructor(private readonly announcementRepo: IAnnouncementRepository) {}

  async execute(input: UpdateAnnouncementInput): Promise<Result<Announcement>> {
    if (!input.id) {
      return Result.fail("Announcement ID is required");
    }

    const existingRes = await this.announcementRepo.getById(input.id);
    if (existingRes.isFailure || !existingRes.value) {
      return Result.fail(`Announcement with ID ${input.id} not found`);
    }

    const announcement = existingRes.value;

    if (input.title !== undefined) {
      if (input.title.trim().length === 0) {
        return Result.fail("Title cannot be empty");
      }
      announcement.title = input.title.trim();
    }

    if (input.category !== undefined) {
      if (input.category.trim().length === 0) {
        return Result.fail("Category cannot be empty");
      }
      announcement.category = input.category.trim();
    }

    if (input.content !== undefined) {
      announcement.content = input.content;
      announcement.description = input.description || input.content.slice(0, 150);
    }

    if (input.imageUrl !== undefined) {
      announcement.imageUrl = input.imageUrl;
    }

    const saveRes = await this.announcementRepo.save(announcement);
    if (saveRes.isFailure) {
      return Result.fail(saveRes.error || "Failed to save announcement");
    }

    return Result.ok(announcement);
  }
}

