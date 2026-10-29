module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Тесты живут в backend/tests/, а не рядом с кодом
  roots: ["<rootDir>/tests"],
  testMatch: [
    "**/tests/unit/**/*.test.ts",
    "**/tests/integration/**/*.test.ts",
    "**/tests/api/**/*.test.ts",
  ],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/main.ts",
    "!src/infrastructure/database/postgres/**/*.ts",
    "!src/infrastructure/database/migrations/**/*.ts",
    "!src/infrastructure/config/**/*.ts",
    "!src/infrastructure/cache/**/*.ts",
    "!src/infrastructure/external-services/**/*.ts",
  ],
  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "coverage",
  testTimeout: 15000,
};
