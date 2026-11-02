import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { Result } from "../../shared/Result";
import { Role } from "../../shared/types";

export interface SearchDirectoryInput {
  query?: string;
  role?: Role;
  groupName?: string;
  page?: number;
  limit?: number;
}

export interface DirectoryUserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: Role;
  groupName?: string;
  avatarUrl?: string;
  birthDate?: string;
  phone?: string;
  telegram?: string;
  isActive: boolean;
  isBirthdayToday?: boolean;
}

export interface SearchDirectoryResultDTO {
  users: DirectoryUserDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class SearchUsersDirectoryUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(input: SearchDirectoryInput): Promise<Result<SearchDirectoryResultDTO>> {
    try {
      if (!this.userRepository.findAll) {
        return Result.fail("Directory search is not supported by repository");
      }

      const paginatedResult = await this.userRepository.findAll({
        search: input.query,
        role: input.role,
        groupName: input.groupName,
        page: input.page || 1,
        limit: input.limit || 50,
        isActive: true,
      });

      if (paginatedResult.isFailure || !paginatedResult.value) {
        return Result.fail(paginatedResult.error || "Failed to search directory");
      }

      const { users, total, page, limit, totalPages } = paginatedResult.value;

      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();

      const formattedUsers: DirectoryUserDTO[] = users.map((u) => {
        let isBirthdayToday = false;
        if (u.birthDate) {
          const parts = u.birthDate.split("-");
          if (parts.length >= 3) {
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            if (m === currentMonth && d === currentDay) {
              isBirthdayToday = true;
            }
          }
        }

        return {
          id: u.id,
          email: u.email.value,
          firstName: u.firstName,
          lastName: u.lastName,
          fullName: `${u.lastName} ${u.firstName}`,
          role: u.role,
          groupName: u.groupName,
          avatarUrl: u.avatarUrl,
          birthDate: u.birthDate,
          phone: u.phone,
          telegram: u.telegram,
          isActive: u.isActive,
          isBirthdayToday,
        };
      });

      return Result.ok({
        users: formattedUsers,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.error("Error in SearchUsersDirectoryUseCase:", error);
      return Result.fail(error instanceof Error ? error.message : "Failed to search directory");
    }
  }
}

