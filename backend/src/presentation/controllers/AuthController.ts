import { Request, Response, NextFunction } from "express";
import { LoginUseCase } from "../../application/auth/LoginUseCase";
import { RegisterUseCase } from "../../application/auth/RegisterUseCase";

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase
  ) {}

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.loginUseCase.execute(email, password);
      if (result.isFailure) {
        return res.status(401).json({ status: "error", error: { message: result.error } });
      }
      return res.json({ status: "success", data: result.value });
    } catch (error) {
      return next(error);
    }
  };

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.registerUseCase.execute(email, password);
      if (result.isFailure) {
        return res.status(400).json({ status: "error", error: { message: result.error } });
      }
      return res.status(201).json({ status: "success", data: result.value });
    } catch (error) {
      return next(error);
    }
  };
}
