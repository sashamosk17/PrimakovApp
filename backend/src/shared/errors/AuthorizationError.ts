import { AppError } from "./AppError";

export class AuthorizationError extends AppError {
  constructor(message: string, code = "AUTHZ_ERROR") {
    super(message, 403, code);
  }
}
