import { Request } from "express";
import { AuthPayload } from "../shared/types";

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}
