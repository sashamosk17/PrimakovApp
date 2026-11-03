import { Grade } from "./Grade";

export class SubjectGradeSummary {
  public readonly averageScore: number;
  public readonly periodMark?: number;

  constructor(
    public readonly subjectName: string,
    public readonly grades: Grade[] = []
  ) {
    if (grades.length === 0) {
      this.averageScore = 0;
      this.periodMark = undefined;
    } else {
      let totalWeightedScore = 0;
      let totalWeight = 0;

      for (const grade of grades) {
        totalWeightedScore += grade.value * grade.weight;
        totalWeight += grade.weight;
      }

      const calculatedAvg = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      this.averageScore = Math.round(calculatedAvg * 100) / 100;
      this.periodMark = Math.round(this.averageScore);
    }
  }

  public toJSON() {
    return {
      subjectName: this.subjectName,
      grades: this.grades.map((g) => (typeof g.toJSON === "function" ? g.toJSON() : g)),
      averageScore: this.averageScore,
      periodMark: this.periodMark ?? null,
    };
  }
}

