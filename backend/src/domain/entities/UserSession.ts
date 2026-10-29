export class UserSession {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly device: string,
    public readonly platform: string,
    public readonly ipAddress: string,
    public readonly location: string,
    public lastActiveAt: Date,
    public readonly createdAt: Date,
    public isCurrent = false
  ) {}

  public updateActivity(): void {
    this.lastActiveAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      device: this.device,
      platform: this.platform,
      ipAddress: this.ipAddress,
      location: this.location,
      lastActiveAt: this.lastActiveAt.toISOString(),
      createdAt: this.createdAt.toISOString(),
      isCurrent: this.isCurrent,
    };
  }
}

