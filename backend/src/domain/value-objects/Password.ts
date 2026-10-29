import { hashSync, compareSync } from "bcrypt";

export class Password {
  private constructor(private readonly _hash: string) {}

  public get hash(): string {
    return this._hash;
  }

  public compare(plainText: string): boolean {
    return compareSync(plainText, this._hash);
  }

  public static create(plainText: string): Password {
    const hashed = hashSync(plainText, 10);
    return new Password(hashed);
  }

  public static fromHash(hash: string): Password {
    return new Password(hash);
  }
}
