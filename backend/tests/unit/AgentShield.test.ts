import path from "path";
import { AgentShield } from "../../src/shared/security/AgentShield";

describe("AgentShield Security & Architecture Guard", () => {
  const controllersPath = path.resolve(__dirname, "../../src/presentation/controllers");

  it("должен подтвердить соответствие всех существующих контроллеров правилам Clean Architecture (без прямого доступа к БД)", () => {
    const audit = AgentShield.auditControllersDirectory(controllersPath);

    expect(audit.isCompliant).toBe(true);
    expect(audit.violations).toEqual([]);
    expect(audit.checkedFilesCount).toBeGreaterThanOrEqual(10);
  });

  it("assertCompliance() не должен выбрасывать исключений для рабочих контроллеров", () => {
    expect(() => AgentShield.assertCompliance(controllersPath)).not.toThrow();
  });
});

