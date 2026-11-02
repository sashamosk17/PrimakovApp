export class AuditLog {
  constructor(
    public readonly id: string,
    public readonly action: string,
    public readonly entity: string,
    public readonly createdAt: Date = new Date(),
    public readonly userId?: string,
    public readonly entityId?: string,
    public readonly details?: Record<string, any>,
    public readonly ipAddress?: string
  ) {}

  public toJSON() {
    return {
      id: this.id,
      action: this.action,
      entity: this.entity,
      userId: this.userId,
      entityId: this.entityId,
      details: this.details,
      ipAddress: this.ipAddress,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

