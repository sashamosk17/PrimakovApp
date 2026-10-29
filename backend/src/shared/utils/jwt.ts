import jwt from "jsonwebtoken";
import { AuthPayload } from "../types";

const getSecret = (): string => process.env.JWT_SECRET || "default_test_jwt_secret_key_primakov_school_12345";

export const signToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
};

export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, getSecret()) as AuthPayload;
};
