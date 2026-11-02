import { Email } from "../value-objects/Email";
import { Password } from "../value-objects/Password";
import { Role } from "../../shared/types";
import { ROLE_PERMISSIONS } from "../../shared/constants";

export class User {
  public updatedAt: Date;

  constructor(
    public readonly id: string,
    public email: Email,
    public password: Password,
    public firstName: string,
    public lastName: string,
    public role: Role,
    public createdAt: Date,
    updatedAt?: Date,
    public isActive = true,
    public vkId?: string,
    public avatarUrl?: string,
    public twoFactorEnabled = false,
    public deletedAt?: Date,
    public groupName?: string,
    public birthDate?: string,
    public phone?: string,
    public telegram?: string
  ) {
    this.updatedAt = updatedAt ?? createdAt;
  }

  public isStudent(): boolean {
    return this.role === "STUDENT";
  }

  public isTeacher(): boolean {
    return this.role === "TEACHER";
  }

  public isAdmin(): boolean {
    return this.role === "ADMIN" || this.role === "SUPERADMIN";
  }

  public hasPermission(permission: string): boolean {
    return ROLE_PERMISSIONS[this.role]?.includes(permission as never) ?? false;
  }

  public verify(password: string): boolean {
    return this.password.compare(password);
  }

  public updateLastLogin(): void {
    this.updatedAt = new Date();
  }

  public updateProfile(
    firstName?: string,
    lastName?: string,
    avatarUrl?: string,
    twoFactorEnabled?: boolean,
    birthDate?: string,
    phone?: string,
    telegram?: string
  ): void {
    if (firstName !== undefined) this.firstName = firstName;
    if (lastName !== undefined) this.lastName = lastName;
    if (avatarUrl !== undefined) this.avatarUrl = avatarUrl;
    if (twoFactorEnabled !== undefined) this.twoFactorEnabled = twoFactorEnabled;
    if (birthDate !== undefined) this.birthDate = birthDate;
    if (phone !== undefined) this.phone = phone;
    if (telegram !== undefined) this.telegram = telegram;
    this.updatedAt = new Date();
  }

  public changePassword(newPassword: Password): void {
    this.password = newPassword;
    this.updatedAt = new Date();
  }

  public softDelete(): void {
    this.deletedAt = new Date();
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public toggleActive(active?: boolean): void {
    this.isActive = active !== undefined ? active : !this.isActive;
    this.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      email: this.email.value,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isActive: this.isActive,
      vkId: this.vkId,
      avatarUrl: this.avatarUrl,
      twoFactorEnabled: this.twoFactorEnabled,
      deletedAt: this.deletedAt ? this.deletedAt.toISOString() : null,
      groupName: this.groupName || null,
      birthDate: this.birthDate || null,
      phone: this.phone || null,
      telegram: this.telegram || null,
    };
  }
}
