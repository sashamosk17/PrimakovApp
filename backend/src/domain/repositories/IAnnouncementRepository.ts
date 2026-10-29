import { Announcement } from "../entities/Announcement";
import { Result } from "../../shared/Result";

export interface IAnnouncementRepository {
  getAll(): Promise<Result<Announcement[]>>;
  getById(id: string): Promise<Result<Announcement | null>>;
  getByCategory(category: string): Promise<Result<Announcement[]>>;
  save(announcement: Announcement): Promise<Result<void>>;
}
