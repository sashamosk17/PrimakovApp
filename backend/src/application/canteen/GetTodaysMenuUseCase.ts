import { Result } from "../../shared/Result";
import { CanteenMenu, ICanteenMenuRepository } from "../../domain/repositories/ICanteenMenuRepository";

export class GetTodaysMenuUseCase {
  constructor(private canteenMenuRepository: ICanteenMenuRepository) { }

  async execute(): Promise<Result<CanteenMenu[]>> {
    const result = await this.canteenMenuRepository.getTodaysMenu();

    if (result.isFailure) {
      return Result.fail(result.error || "Unknown error");
    }

    const menus = result.value || [];
    return Result.ok(menus);
  }
}
