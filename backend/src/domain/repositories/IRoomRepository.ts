import { Result } from "../../shared/Result";

export interface Room {
  id: string;
  number: string;
  name?: string;
  building: string;
  floor: number;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoomRepository {
  getAll(): Promise<Result<Room[]>>;
  getById(id: string): Promise<Result<Room | null>>;
  getByNumber(number: string): Promise<Result<Room | null>>;
  getByBuilding(building: string): Promise<Result<Room[]>>;
  getByFloor(building: string, floor: number): Promise<Result<Room[]>>;
  save(room: Room): Promise<Result<void>>;
  update(room: Room): Promise<Result<void>>;
}

