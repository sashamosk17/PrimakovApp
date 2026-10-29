import { IAnnouncementRepository } from "../../domain/repositories/IAnnouncementRepository";
import { Announcement } from "../../domain/entities/Announcement";
import { Result } from "../../shared/Result";

export class GetAnnouncementsUseCase {
  constructor(private readonly announcementRepository: IAnnouncementRepository) {}

  public async execute(): Promise<Result<Announcement[]>> {
    const result = await this.announcementRepository.getAll();
    return result;
  }
}
