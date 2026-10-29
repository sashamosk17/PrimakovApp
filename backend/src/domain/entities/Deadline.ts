import { DeadlineStatus } from "../value-objects/DeadlineStatus";
import { Result } from "../../shared/Result";

export class Deadline {
  public updatedAt: Date;

  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public dueDate: Date,
    public userId: string,
    public status: DeadlineStatus,
    public createdAt: Date,
    updatedAt?: Date,
    public completedAt?: Date,
    public subject?: string
  ) {
    this.updatedAt = updatedAt ?? createdAt;
  }

  public complete(): Result<void> {
    if (this.status === DeadlineStatus.COMPLETED) {
      return Result.fail("Deadline already completed");
    }
    this.status = DeadlineStatus.COMPLETED;
    this.completedAt = new Date();
    this.updatedAt = new Date();
    return Result.ok();
  }

  public uncomplete(): Result<void> {
    if (this.status === DeadlineStatus.PENDING) {
      return Result.fail("Deadline is not completed");
    }
    this.status = DeadlineStatus.PENDING;
    this.completedAt = undefined;
    this.updatedAt = new Date();
    return Result.ok();
  }

  public isOverdue(): boolean {
    return this.status !== DeadlineStatus.COMPLETED && new Date() > this.dueDate;
  }

  public getDaysLeft(): number {
    const diff = this.dueDate.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  public changeTitle(newTitle: string): Result<void> {
    if (!newTitle.trim()) {
      return Result.fail("Invalid title");
    }
    this.title = newTitle;
    return Result.ok();
  }

  public extend(newDate: Date): Result<void> {
    if (newDate <= this.dueDate) {
      return Result.fail("New date must be later than current date");
    }
    this.dueDate = newDate;
    return Result.ok();
  }
}
