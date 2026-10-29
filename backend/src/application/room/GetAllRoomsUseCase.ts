import { Result } from "../../shared/Result";
import { Room, IRoomRepository } from "../../domain/repositories/IRoomRepository";

export class GetAllRoomsUseCase {
  constructor(private roomRepository: IRoomRepository) {}

  async execute(): Promise<Result<Room[]>> {
    return await this.roomRepository.getAll();
  }
}
