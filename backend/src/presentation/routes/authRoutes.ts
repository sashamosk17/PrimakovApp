import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../../domain/services/AuthService";
import { LoginUseCase } from "../../application/auth/LoginUseCase";
import { RegisterUseCase } from "../../application/auth/RegisterUseCase";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { authRateLimiter } from "../../infrastructure/config/rateLimiter";
import { validate } from "../middleware/validationMiddleware";
import { loginSchema, registerSchema } from "../../domain/validation/authSchemas";

export const authRoutes = (userRepository: IUserRepository) => {
  const router = Router();
  const authService = new AuthService(userRepository);
  const controller = new AuthController(new LoginUseCase(authService), new RegisterUseCase(authService));

  // Apply rate limiting and validation to auth endpoints
  router.post("/login", authRateLimiter, validate(loginSchema), controller.login);
  router.post("/register", authRateLimiter, validate(registerSchema), controller.register);

  return router;
};
