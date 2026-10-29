/*
 * Use case for retrieving announcements by category
 */

import { IAnnouncementRepository } from "../../domain/repositories/IAnnouncementRepository";
import { Announcement } from "../../domain/entities/Announcement";
import { Result } from "../../shared/Result";

export class GetAnnouncementByCategoryUseCase {
  constructor(private readonly announcementRepository: IAnnouncementRepository) {}

  public async execute(category: string): Promise<Result<Announcement[]>> {
    const result = await this.announcementRepository.getByCategory(category);
    return result;
  }
}
