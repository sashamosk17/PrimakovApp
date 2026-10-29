import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { Result } from "../../shared/Result";
import { User } from "../../domain/entities/User";

export class GetTeachersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(): Promise<Result<User[]>> {
    return this.userRepository.findByRole("TEACHER");
  }
}
