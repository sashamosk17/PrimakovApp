import { Story } from "../../../domain/entities/Story";
import { IStoryRepository } from "../../../domain/repositories/IStoryRepository";
import { Result } from "../../../shared/Result";

export class MockStoryRepository implements IStoryRepository {
  private stories: Story[] = [];

  constructor() {
    this.initializeTestData();
  }

  private initializeTestData(): void {
    const today = new Date();

    this.stories = [
      {
        id: "story-1",
        title: "День открытых дверей",
        description: "Посетите наше школьное мероприятие",
        imageUrl: "https://via.placeholder.com/400x300?text=Open+Day",
        author: "admin",
        createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000),
        viewedBy: ["user-1", "user-2"],
      },
      {
        id: "story-2",
        title: "Научная конференция",
        description: "Ученики представляют свои проекты",
        imageUrl: "https://via.placeholder.com/400x300?text=Science+Fair",
        author: "teacher-1",
        createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        viewedBy: ["user-1"],
      },
      {
        id: "story-3",
        title: "Спортивный турнир",
        description: "Соревнования по волейболу и баскетболу",
        imageUrl: "https://via.placeholder.com/400x300?text=Sports",
        author: "teacher-2",
        createdAt: today,
        expiresAt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        viewedBy: [],
      },
      {
        id: "story-4",
        title: "Концерт музыки",
        description: "Выступление школьного оркестра",
        videoUrl: "https://example.com/video.mp4",
        author: "admin",
        createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        viewedBy: ["user-2", "user-3"],
      },
      {
        id: "story-5",
        title: "Благоустройство кампуса",
        description: "Помощь в озеленении школьного двора",
        imageUrl: "https://via.placeholder.com/400x300?text=Cleanup",
        author: "admin",
        createdAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        viewedBy: ["user-1", "user-2", "user-3"],
      },
      {
        id: "story-6",
        title: "30-я юбилейная конференция «Санкт-Петербургская Модель ООН»",
        description: "Торжественное мероприятие, посвященное 30-летию конференции",
        imageUrl: "assets/images/primakov_stories.jpeg",
        author: "admin",
        createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000),
        viewedBy: [],
        linkUrl: "https://primakov.school/news/yubileynaya-konferentsiya-sankt-model-oon-",
        linkText: "30-я юбилейная конференция «Санкт-Петербургская Модель ООН»",
      },
      {
        id: "story-7",
        title: "Встреча, после которой космос уже не кажется далёким",
        description: "Уникальная встреча с представителями космической отрасли",
        imageUrl: "assets/images/primakov_strories2.jpeg",
        author: "admin",
        createdAt: today,
        expiresAt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        viewedBy: [],
        linkUrl: "https://primakov.school/news/vstrecha-posle-kotoroy-kosmos-uzhe-ne-kazhetsya-dalyokim",
        linkText: "Встреча, после которой космос уже не кажется далёким",
      },
    ];
  }

  async getAll(): Promise<Result<Story[]>> {
    const now = new Date();
    const activeStories = this.stories.filter((s) => s.expiresAt > now);
    return Result.ok(activeStories);
  }

  async getById(id: string): Promise<Result<Story | null>> {
    const story = this.stories.find((s) => s.id === id);
    return Result.ok(story || null);
  }

  async save(story: Story): Promise<Result<void>> {
    this.stories.push(story);
    return Result.ok();
  }

  async markAsViewed(storyId: string, userId: string): Promise<Result<void>> {
    const story = this.stories.find((s) => s.id === storyId);
    if (story && !story.viewedBy.includes(userId)) {
      story.viewedBy.push(userId);
    }
    return Result.ok();
  }
}
