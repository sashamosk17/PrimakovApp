export type Role = "STUDENT" | "TEACHER" | "ADMIN" | "SUPERADMIN";

export type Permission =
  | "schedule:read"
  | "deadline:create"
  | "deadline:read"
  | "deadline:update:own"
  | "rating:create"
  | "rating:update:own"
  | "rating:read:all"
  | "review:read"
  | "review:read:own"
  | "rating:read:own"
  | "users:create"
  | "users:read:all"
  | "users:update"
  | "users:delete"
  | "analytics:read";

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
  permissions: Permission[];
}
