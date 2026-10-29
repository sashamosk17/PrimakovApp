import { Result } from "../../shared/Result";
import { CanteenMenu, ICanteenMenuRepository } from "../../domain/repositories/ICanteenMenuRepository";

export class GetMenuByDateUseCase {
  constructor(private canteenMenuRepository: ICanteenMenuRepository) {}

  async execute(date: Date): Promise<Result<CanteenMenu[]>> {
    return await this.canteenMenuRepository.getByDate(date);
  }
}
