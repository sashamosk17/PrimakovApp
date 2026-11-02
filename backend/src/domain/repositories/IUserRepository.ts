import { User } from "../entities/User";
import { Result } from "../../shared/Result";
import { Role } from "../../shared/types";

export interface UserFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
  groupName?: string;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IUserRepository {
  findById(id: string): Promise<Result<User | null>>;
  findByEmail(email: string): Promise<Result<User | null>>;
  findByRole(role: Role): Promise<Result<User[]>>;
  save(user: User): Promise<Result<void>>;
  findAll?(filter?: UserFilter): Promise<Result<PaginatedUsers>>;
  delete?(id: string): Promise<Result<void>>;
  countByRole?(): Promise<Result<Record<Role, number>>>;
}
