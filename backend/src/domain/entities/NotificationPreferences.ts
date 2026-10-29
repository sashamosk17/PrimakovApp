export class NotificationPreferences {
  constructor(
    public readonly userId: string,
    public pushEnabled: boolean = true,
    public deadlineNotifications: boolean = true,
    public scheduleNotifications: boolean = true,
    public announcementNotifications: boolean = true,
    public updatedAt: Date = new Date()
  ) {}

  public update(props: {
    pushEnabled?: boolean;
    deadlineNotifications?: boolean;
    scheduleNotifications?: boolean;
    announcementNotifications?: boolean;
  }): void {
    if (props.pushEnabled !== undefined) this.pushEnabled = props.pushEnabled;
    if (props.deadlineNotifications !== undefined) this.deadlineNotifications = props.deadlineNotifications;
    if (props.scheduleNotifications !== undefined) this.scheduleNotifications = props.scheduleNotifications;
    if (props.announcementNotifications !== undefined) this.announcementNotifications = props.announcementNotifications;
    this.updatedAt = new Date();
  }

  public toJSON() {
    return {
      userId: this.userId,
      pushEnabled: this.pushEnabled,
      deadlineNotifications: this.deadlineNotifications,
      scheduleNotifications: this.scheduleNotifications,
      announcementNotifications: this.announcementNotifications,
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

