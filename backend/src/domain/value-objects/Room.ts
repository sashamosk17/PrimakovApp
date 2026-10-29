import { Result } from "../../shared/Result";

export class Room {
  private constructor(
    private readonly _number: string,
    private readonly _building: string,
    private readonly _floor: number
  ) {}

  public get number(): string {
    return this._number;
  }

  public get building(): string {
    return this._building;
  }

  public get floor(): number {
    return this._floor;
  }

  public static create(number: string, building: string, floor: number): Result<Room> {
    if (!number || !building || Number.isNaN(floor)) {
      return Result.fail("Invalid room");
    }
    return Result.ok(new Room(number, building, floor));
  }

  public fullName(): string {
    return `${this._number}-${this._building}, floor ${this._floor}`;
  }
}
