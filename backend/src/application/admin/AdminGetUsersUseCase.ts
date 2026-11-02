import { IUserRepository, UserFilter, PaginatedUsers } from "../../domain/repositories/IUserRepository";
import { Result } from "../../shared/Result";

export class AdminGetUsersUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(filter: UserFilter): Promise<Result<PaginatedUsers>> {
    if (this.userRepo.findAll) {
      return this.userRepo.findAll(filter);
    }

    // Fallback if findAll is not implemented
    const studentsRes = await this.userRepo.findByRole("STUDENT");
    const teachersRes = await this.userRepo.findByRole("TEACHER");
    const allUsers = [
      ...(studentsRes.value || []),
      ...(teachersRes.value || []),
    ];

    const total = allUsers.length;
    const page = filter.page || 1;
    const limit = filter.limit || 20;

    return Result.ok({
      users: allUsers.slice((page - 1) * limit, page * limit),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  }
}

