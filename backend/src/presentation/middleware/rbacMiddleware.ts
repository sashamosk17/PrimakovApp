import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { AuthorizationError } from "../../shared/errors/AuthorizationError";
import { Permission } from "../../shared/types";

export const rbacMiddleware = (required: Permission[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const permissions = req.user?.permissions || [];
    const hasAll = required.every((perm) => permissions.includes(perm));
    if (!hasAll) {
      return next(new AuthorizationError("Permission denied"));
    }
    return next();
  };
};
