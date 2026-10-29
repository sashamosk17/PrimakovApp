import { Result } from "../../shared/Result";
import { ValidationError } from "../../shared/errors/ValidationError";

export class Email {
  private constructor(private readonly _value: string) {}

  public get value(): string {
    return this._value;
  }

  public get domain(): string {
    return this._value.split("@")[1];
  }

  public static create(value: string): Result<Email> {
    const normalized = value.trim().toLowerCase();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    if (!isValid) {
      return Result.fail(new ValidationError("Invalid email").message);
    }
    return Result.ok(new Email(normalized));
  }

  public equals(other: Email): boolean {
    return this._value === other._value;
  }
}
