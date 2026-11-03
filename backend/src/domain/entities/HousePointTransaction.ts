export type HouseName = "NORTH" | "SOUTH" | "EAST" | "WEST";

export type HouseCategory =
  | "ACADEMIC"
  | "OLYMPIAD"
  | "SPORTS"
  | "CHARITY"
  | "CULTURE";

export class HousePointTransaction {
  constructor(
    public readonly id: string,
    public readonly house: HouseName,
    public readonly points: number,
    public readonly category: HouseCategory,
    public readonly reason: string,
    public readonly awardedBy: string,
    public readonly studentId?: string,
    public readonly createdAt: Date = new Date()
  ) {
    if (points <= 0) {
      throw new Error(`House points must be positive, received ${points}`);
    }
    const validHouses: HouseName[] = ["NORTH", "SOUTH", "EAST", "WEST"];
    if (!validHouses.includes(house)) {
      throw new Error(`Invalid house name: ${house}`);
    }
  }

  public toJSON() {
    return {
      id: this.id,
      house: this.house,
      points: this.points,
      category: this.category,
      reason: this.reason,
      awardedBy: this.awardedBy,
      studentId: this.studentId || null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

