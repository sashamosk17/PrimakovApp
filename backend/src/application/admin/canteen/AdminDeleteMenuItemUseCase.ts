import { ICanteenMenuRepository } from "../../../domain/repositories/ICanteenMenuRepository";
import { Result } from "../../../shared/Result";

export class AdminDeleteMenuItemUseCase {
  constructor(private readonly canteenRepository: ICanteenMenuRepository) {}

  async execute(itemId: string): Promise<Result<void>> {
    try {
      if (!itemId || !itemId.trim()) {
        return Result.fail("Item ID cannot be empty");
      }

      const removeRes = await this.canteenRepository.removeMenuItem(itemId.trim());
      if (removeRes.isFailure) {
        return Result.fail(removeRes.error || "Failed to remove menu item");
      }

      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to delete menu item: ${error}`);
    }
  }
}
