import { Response, NextFunction } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { verifyToken } from "../../shared/utils/jwt";
import { AuthenticationError } from "../../shared/errors/AuthenticationError";
import { AuthenticatedRequest } from "../types";

export const authMiddleware = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      throw new AuthenticationError("Missing token");
    }
    const token = header.split(" ")[1];
    if (!token) {
      throw new AuthenticationError("Invalid token");
    }
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new AuthenticationError("Token expired"));
    }
    if (error instanceof JsonWebTokenError) {
      return next(new AuthenticationError("Invalid token"));
    }
    return next(error);
  }
};

export const optionalAuthMiddleware = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return next();
    }
    const token = header.split(" ")[1];
    if (!token) {
      return next();
    }
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return next();
  }
};
