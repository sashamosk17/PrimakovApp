import { Result } from "../../shared/Result";
import { Room, IRoomRepository } from "../../domain/repositories/IRoomRepository";

export class GetRoomByNumberUseCase {
  constructor(private roomRepository: IRoomRepository) {}

  async execute(number: string): Promise<Result<Room | null>> {
    return await this.roomRepository.getByNumber(number);
  }
}
