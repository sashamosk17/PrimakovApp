import { IAnnouncementRepository } from "../../domain/repositories/IAnnouncementRepository";
import { Result } from "../../shared/Result";

export class DeleteAnnouncementUseCase {
  constructor(private readonly announcementRepo: IAnnouncementRepository) {}

  async execute(announcementId: string): Promise<Result<void>> {
    if (this.announcementRepo.delete) {
      return this.announcementRepo.delete(announcementId);
    }
    return Result.fail("Delete announcement operation not supported");
  }
}

