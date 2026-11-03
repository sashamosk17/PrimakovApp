import { IBoardingRepository, BoardingRosterItem } from "../../domain/repositories/IBoardingRepository";
import { Result } from "../../shared/Result";

export class GetBoardingRosterUseCase {
  constructor(private readonly boardingRepository: IBoardingRepository) {}

  public async execute(date?: string): Promise<Result<BoardingRosterItem[]>> {
    try {
      const roster = await this.boardingRepository.getBoardingRoster(date);
      return Result.ok<BoardingRosterItem[]>(roster);
    } catch (err: any) {
      return Result.fail(err.message || "Failed to retrieve boarding roster");
    }
  }
}

