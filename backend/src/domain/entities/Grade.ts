export class Grade {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly subjectId: string,
    public readonly subjectName: string,
    public readonly value: number,
    public readonly weight: number = 1.0,
    public readonly date: string = new Date().toISOString(),
    public readonly period: string = "1 триместр",
    public readonly topic?: string
  ) {
    if (value < 2 || value > 5) {
      throw new Error(`Grade value must be between 2 and 5, received ${value}`);
    }
    if (weight <= 0) {
      throw new Error(`Grade weight must be positive, received ${weight}`);
    }
  }

  public toJSON() {
    return {
      id: this.id,
      studentId: this.studentId,
      subjectId: this.subjectId,
      subjectName: this.subjectName,
      value: this.value,
      weight: this.weight,
      date: this.date,
      period: this.period,
      topic: this.topic || null,
    };
  }
}

