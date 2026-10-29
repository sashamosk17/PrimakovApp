import { IRoomRepository, Room } from "../../../domain/repositories/IRoomRepository";
import { Result } from "../../../shared/Result";

export class MockRoomRepository implements IRoomRepository {
  private rooms: Room[] = [];

  constructor() {
    this.initializeTestData();
  }

  private initializeTestData(): void {
    const now = new Date();
    this.rooms = [
      {
        id: "room-101",
        number: "101",
        name: "Кабинет математики",
        building: "Main",
        floor: 1,
        capacity: 30,
        description: "Кабинет математики и информатики",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "room-102",
        number: "102",
        name: "Кабинет русского языка",
        building: "Main",
        floor: 1,
        capacity: 28,
        description: "Кабинет русского языка и литературы",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "room-201",
        number: "201",
        name: "Кабинет физики",
        building: "Main",
        floor: 2,
        capacity: 25,
        description: "Лаборатория физики",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "room-202",
        number: "202",
        name: "Кабинет химии",
        building: "Main",
        floor: 2,
        capacity: 25,
        description: "Лаборатория химии",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "room-sports-1",
        number: "S1",
        name: "Спортзал",
        building: "Sports",
        floor: 1,
        capacity: 100,
        description: "Большой спортивный зал",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  async getAll(): Promise<Result<Room[]>> {
    return Result.ok(this.rooms.filter((r) => r.isActive));
  }

  async getById(id: string): Promise<Result<Room | null>> {
    const room = this.rooms.find((r) => r.id === id);
    return Result.ok(room || null);
  }

  async getByNumber(number: string): Promise<Result<Room | null>> {
    const room = this.rooms.find((r) => r.number === number && r.isActive);
    return Result.ok(room || null);
  }

  async getByBuilding(building: string): Promise<Result<Room[]>> {
    const rooms = this.rooms.filter(
      (r) => r.building.toLowerCase() === building.toLowerCase() && r.isActive
    );
    return Result.ok(rooms);
  }

  async getByFloor(building: string, floor: number): Promise<Result<Room[]>> {
    const rooms = this.rooms.filter(
      (r) =>
        r.building.toLowerCase() === building.toLowerCase() &&
        r.floor === floor &&
        r.isActive
    );
    return Result.ok(rooms);
  }

  async save(room: Room): Promise<Result<void>> {
    this.rooms.push(room);
    return Result.ok();
  }

  async update(room: Room): Promise<Result<void>> {
    const index = this.rooms.findIndex((r) => r.id === room.id);
    if (index >= 0) {
      this.rooms[index] = room;
    }
    return Result.ok();
  }
}

