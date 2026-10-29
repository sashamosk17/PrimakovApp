import { AppError } from "./AppError";

export class DomainError extends AppError {
  constructor(message: string, code = "DOMAIN_ERROR") {
    super(message, 400, code);
  }
}
