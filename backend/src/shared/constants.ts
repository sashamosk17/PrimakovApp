import { Permission, Role } from "./types";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  STUDENT: [
    "schedule:read",
    "deadline:create",
    "deadline:read",
    "deadline:update:own",
    "rating:create"
  ],
  TEACHER: ["schedule:read", "review:read:own", "rating:read:own"],
  ADMIN: [
    "schedule:read",
    "users:create",
    "users:read:all",
    "users:update",
    "users:delete",
    "analytics:read",
    "rating:read:all"
  ],
  SUPERADMIN: [
    "schedule:read",
    "users:create",
    "users:read:all",
    "users:update",
    "users:delete",
    "analytics:read",
    "rating:read:all"
  ]
};
