import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "error",
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: error.issues.map((e: any) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }
      next(error);
    }
  };
};

// Legacy middleware for backward compatibility
export const validationMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
  return next();
};
