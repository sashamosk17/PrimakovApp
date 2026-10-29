import { Announcement } from "../../../domain/entities/Announcement";
import { IAnnouncementRepository } from "../../../domain/repositories/IAnnouncementRepository";
import { Result } from "../../../shared/Result";

export class MockAnnouncementRepository implements IAnnouncementRepository {
  private announcements: Announcement[] = [];

  constructor() {
    this.initializeTestData();
  }

  private initializeTestData(): void {
    const today = new Date();

    this.announcements = [
      {
        id: "announcement-1",
        title: "Начало второй четверти",
        description: "Школа начинает работу в штатном режиме",
        content: "Все уроки начинаются в обычное время. Родители просят убедиться в наличии учебников.",
        date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        category: "IMPORTANT",
        createdAt: today,
        authorId: "admin-1",
      },
      {
        id: "announcement-2",
        title: "Профилактические работы в столовой",
        description: "Столовая закрыта на техническое обслуживание",
        content: "Столовая будет закрыта с 22 по 25 января. Обед переносится в учебный класс.",
        date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        category: "MAINTENANCE",
        createdAt: today,
        authorId: "admin-1",
      },
      {
        id: "announcement-3",
        title: "Олимпиада по Математике",
        description: "Школьный этап олимпиады по математике",
        content:
          "Регистрация открыта до 25 января. Участие добровольное. Призы и дипломы для победителей.",
        date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
        category: "EVENT",
        createdAt: today,
        authorId: "teacher-1",
      },
      {
        id: "announcement-4",
        title: "Каникулы переносятся",
        description: "Расписание каникул изменилось",
        content:
          "Весенние каникулы сдвинуты на неделю. Новые даты будут объявлены завтра. Просим отнестись к этому с пониманием.",
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        category: "IMPORTANT",
        createdAt: today,
        authorId: "admin-1",
      },
      {
        id: "announcement-5",
        title: "День науки в школе",
        description: "Ежегодное событие с представлением проектов",
        content:
          "Учащиеся смогут продемонстрировать свои научные исследования. Желающих участвовать просим зарегистрироваться у классного руководителя.",
        date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        category: "EVENT",
        createdAt: today,
        authorId: "admin-1",
      },
    ];
  }

  async getAll(): Promise<Result<Announcement[]>> {
    return Result.ok(this.announcements);
  }

  async getById(id: string): Promise<Result<Announcement | null>> {
    const announcement = this.announcements.find((a) => a.id === id);
    return Result.ok(announcement || null);
  }

  async getByCategory(category: string): Promise<Result<Announcement[]>> {
    const categoryAnnouncements = this.announcements.filter((a) => a.category === category);
    return Result.ok(categoryAnnouncements);
  }

  async save(announcement: Announcement): Promise<Result<void>> {
    this.announcements.push(announcement);
    return Result.ok();
  }
}
