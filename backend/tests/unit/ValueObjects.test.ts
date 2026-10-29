import { Email } from "../../src/domain/value-objects/Email";
import { Password } from "../../src/domain/value-objects/Password";

// ───────────────────────────────────────────
// Email Value Object
// ───────────────────────────────────────────
describe("Email Value Object", () => {
  describe("create()", () => {
    it("должен создать валидный email", () => {
      const result = Email.create("test@example.com");

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe("test@example.com");
    });

    it("должен привести email к нижнему регистру", () => {
      const result = Email.create("TEST@EXAMPLE.COM");

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe("test@example.com");
    });

    it("должен обрезать пробелы по краям", () => {
      const result = Email.create("  user@school.ru  ");

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe("user@school.ru");
    });

    it("должен принимать школьный email с длинным доменом", () => {
      const result = Email.create("ivan.petrov@primakov.school");

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe("ivan.petrov@primakov.school");
    });

    it("должен отклонять email без символа @", () => {
      const result = Email.create("noeatsign.com");
      expect(result.isFailure).toBe(true);
    });

    it("должен отклонять email без домена", () => {
      const result = Email.create("user@");
      expect(result.isFailure).toBe(true);
    });

    it("должен отклонять пустую строку", () => {
      const result = Email.create("");
      expect(result.isFailure).toBe(true);
    });

    it("должен отклонять email без точки в домене", () => {
      const result = Email.create("user@domain");
      expect(result.isFailure).toBe(true);
    });

    it("должен отклонять email с несколькими @", () => {
      const result = Email.create("a@b@c.com");
      expect(result.isFailure).toBe(true);
    });
  });

  describe("domain getter", () => {
    it("должен вернуть только доменную часть email", () => {
      const email = Email.create("student@primakov.school").value;
      expect(email.domain).toBe("primakov.school");
    });

    it("должен работать с субдоменами", () => {
      const email = Email.create("user@mail.example.com").value;
      expect(email.domain).toBe("mail.example.com");
    });
  });

  describe("equals()", () => {
    it("должен возвращать true для одинаковых адресов", () => {
      const e1 = Email.create("user@test.com").value;
      const e2 = Email.create("user@test.com").value;
      expect(e1.equals(e2)).toBe(true);
    });

    it("должен возвращать false для разных адресов", () => {
      const e1 = Email.create("user1@test.com").value;
      const e2 = Email.create("user2@test.com").value;
      expect(e1.equals(e2)).toBe(false);
    });

    it("должен быть нечувствителен к регистру", () => {
      const e1 = Email.create("USER@TEST.COM").value;
      const e2 = Email.create("user@test.com").value;
      expect(e1.equals(e2)).toBe(true);
    });
  });
});

// ───────────────────────────────────────────
// Password Value Object
// ───────────────────────────────────────────
describe("Password Value Object", () => {
  describe("create()", () => {
    it("должен создать Password из открытого текста", () => {
      const password = Password.create("mypassword");
      expect(password).toBeDefined();
      expect(password.hash).toBeDefined();
      expect(password.hash.length).toBeGreaterThan(0);
    });

    it("хеш должен отличаться от исходного пароля", () => {
      const password = Password.create("password123");
      expect(password.hash).not.toBe("password123");
    });

    it("два разных вызова create() дают разные хеши (bcrypt salt)", () => {
      const p1 = Password.create("samepassword");
      const p2 = Password.create("samepassword");
      // bcrypt всегда добавляет случайный salt
      expect(p1.hash).not.toBe(p2.hash);
    });
  });

  describe("fromHash()", () => {
    it("должен восстановить Password из хеша", () => {
      const original = Password.create("testpassword");
      const fromHash = Password.fromHash(original.hash);

      expect(fromHash.hash).toBe(original.hash);
    });
  });

  describe("compare()", () => {
    it("должен вернуть true для правильного пароля", () => {
      const password = Password.create("correctpassword");
      expect(password.compare("correctpassword")).toBe(true);
    });

    it("должен вернуть false для неправильного пароля", () => {
      const password = Password.create("correctpassword");
      expect(password.compare("wrongpassword")).toBe(false);
    });

    it("должен быть чувствителен к регистру", () => {
      const password = Password.create("Password123");
      expect(password.compare("password123")).toBe(false);
      expect(password.compare("Password123")).toBe(true);
    });

    it("должен вернуть false для пустой строки", () => {
      const password = Password.create("anypassword");
      expect(password.compare("")).toBe(false);
    });

    it("compare() через fromHash() должен работать корректно", () => {
      const original = Password.create("mypassword");
      const restored = Password.fromHash(original.hash);

      expect(restored.compare("mypassword")).toBe(true);
      expect(restored.compare("wrongpassword")).toBe(false);
    });
  });
});
