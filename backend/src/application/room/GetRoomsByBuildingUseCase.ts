import { Result } from "../../shared/Result";
import { Room, IRoomRepository } from "../../domain/repositories/IRoomRepository";

export class GetRoomsByBuildingUseCase {
  constructor(private roomRepository: IRoomRepository) {}

  async execute(building: string): Promise<Result<Room[]>> {
    return await this.roomRepository.getByBuilding(building);
  }
}
