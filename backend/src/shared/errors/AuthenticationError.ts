import { AppError } from "./AppError";

export class AuthenticationError extends AppError {
  constructor(message: string, code = "AUTH_ERROR") {
    super(message, 401, code);
  }
}
