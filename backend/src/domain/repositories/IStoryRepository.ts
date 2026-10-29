import { Story } from "../entities/Story";
import { Result } from "../../shared/Result";

export interface IStoryRepository {
  getAll(): Promise<Result<Story[]>>;
  getById(id: string): Promise<Result<Story | null>>;
  save(story: Story): Promise<Result<void>>;
  markAsViewed(storyId: string, userId: string): Promise<Result<void>>;
}
