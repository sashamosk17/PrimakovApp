import { Result } from "../../shared/Result";
import { Room, IRoomRepository } from "../../domain/repositories/IRoomRepository";

export class GetRoomsByFloorUseCase {
  constructor(private roomRepository: IRoomRepository) { }

  async execute(building: string, floor: number): Promise<Result<Room[]>> {
    return await this.roomRepository.getByFloor(building, floor);
  }
}
