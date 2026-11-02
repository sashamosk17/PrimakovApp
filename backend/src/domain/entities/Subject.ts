export class Subject {
  public updatedAt: Date;

  constructor(
    public readonly id: string,
    public name: string,
    public description?: string,
    public createdAt: Date = new Date(),
    updatedAt?: Date
  ) {
    this.updatedAt = updatedAt ?? createdAt;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

