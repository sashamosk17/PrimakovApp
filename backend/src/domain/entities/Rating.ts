import { Result } from "../../shared/Result";

export type RatingStatus = 'APPROVED' | 'HIDDEN' | 'PENDING';

export class Rating {
  public updatedAt: Date;
  public status: RatingStatus;

  constructor(
    public readonly id: string,
    public teacherId: string,
    public userId: string,
    public value: number,
    public createdAt: Date,
    public comment: string = '',
    updatedAt?: Date,
    public version = 0,
    public ipHash?: string,
    status: RatingStatus = 'APPROVED'
  ) {
    this.updatedAt = updatedAt ?? createdAt;
    this.status = status;
  }

  public canBeUpdated(): boolean {
    return this.value >= 1 && this.value <= 10;
  }

  public update(newValue: number): Result<void> {
    if (newValue < 1 || newValue > 10) {
      return Result.fail("Invalid rating value");
    }
    this.value = newValue;
    this.version += 1;
    this.updatedAt = new Date();
    return Result.ok();
  }

  public moderate(status: RatingStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  public isOlderThan(days: number): boolean {
    const diff = new Date().getTime() - this.updatedAt.getTime();
    return diff > days * 24 * 60 * 60 * 1000;
  }

  public toJSON() {
    return {
      id: this.id,
      teacherId: this.teacherId,
      userId: this.userId,
      value: this.value,
      comment: this.comment,
      status: this.status,
      version: this.version,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
