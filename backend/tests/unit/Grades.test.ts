import { Grade } from "../../src/domain/entities/Grade";
import { SubjectGradeSummary } from "../../src/domain/entities/SubjectGradeSummary";
import { AdminImportMeshGradesUseCase } from "../../src/application/grades/AdminImportMeshGradesUseCase";
import { GetStudentGradesUseCase } from "../../src/application/grades/GetStudentGradesUseCase";
import { MockGradeRepository } from "../../src/infrastructure/database/memory/MockGradeRepository";
import { MockUserRepository } from "../../src/infrastructure/database/memory/MockUserRepository";
import { User } from "../../src/domain/entities/User";
import { Email } from "../../src/domain/value-objects/Email";
import { Password } from "../../src/domain/value-objects/Password";

describe("Grades Domain and Use Cases", () => {
  let gradeRepository: MockGradeRepository;
  let userRepository: MockUserRepository;
  let testStudent: User;

  beforeEach(() => {
    gradeRepository = new MockGradeRepository();
    userRepository = new MockUserRepository();

    testStudent = new User(
      "11111111-1111-4111-8111-111111111111",
      Email.create("andrey.orlov@primakov.school").value,
      Password.fromHash("$2b$10$hashedpasswordplaceholder1234567890"),
      "Андрей",
      "Орлов",
      "STUDENT",
      new Date(),
      undefined,
      true,
      undefined,
      undefined,
      false,
      undefined,
      "10А"
    );
    userRepository.save(testStudent);
  });

  describe("Grade Entity", () => {
    it("should instantiate Grade with valid fields and calculate weights correctly", () => {
      const grade = new Grade(
        "22222222-2222-4222-8222-222222222222",
        testStudent.id,
        "math-sub-1",
        "Алгебра",
        5,
        2.0,
        "2026-10-15T10:00:00Z",
        "1 триместр",
        "Контрольная работа по тригонометрии"
      );

      expect(grade.id).toBe("22222222-2222-4222-8222-222222222222");
      expect(grade.studentId).toBe(testStudent.id);
      expect(grade.subjectName).toBe("Алгебра");
      expect(grade.value).toBe(5);
      expect(grade.weight).toBe(2.0);
      expect(grade.period).toBe("1 триместр");
    });

    it("should correctly compute SubjectGradeSummary weighted average and period mark", () => {
      const g1 = new Grade("g-1", testStudent.id, "sub-1", "Алгебра", 5, 1, "2026-10-01", "1 триместр");
      const g2 = new Grade("g-2", testStudent.id, "sub-1", "Алгебра", 4, 1, "2026-10-05", "1 триместр");
      const g3 = new Grade("g-3", testStudent.id, "sub-1", "Алгебра", 5, 2, "2026-10-10", "1 триместр"); // exam

      // sum(5*1 + 4*1 + 5*2) = 5 + 4 + 10 = 19
      // sum(weights) = 1 + 1 + 2 = 4
      // avg = 19 / 4 = 4.75 -> round mark = 5
      const summary = new SubjectGradeSummary("Алгебра", [g1, g2, g3]);

      expect(summary.subjectName).toBe("Алгебра");
      expect(summary.averageScore).toBe(4.75);
      expect(summary.periodMark).toBe(5);
    });
  });

  describe("AdminImportMeshGradesUseCase", () => {
    it("should parse standard Mesh CSV lines and save batch of grades", async () => {
      const useCase = new AdminImportMeshGradesUseCase(gradeRepository, userRepository);

      const csvData = `Класс, ФИО Ученика, Предмет, Оценки, Период
10А, Орлов Андрей, Алгебра, "5(1) 4(1) 5(2)", 1 триместр
10А, Орлов Андрей, Физика, "4(1) 4(1.5)", 1 триместр`;

      const result = await useCase.execute({ csvData });

      expect(result.isSuccess).toBe(true);
      const data = result.value;
      expect(data.matchedStudentsCount).toBe(1);
      expect(data.importedGradesCount).toBe(5); // 3 from algebra + 2 from physics

      const studentGrades = await gradeRepository.findByStudentAndPeriod(testStudent.id, "1 триместр");
      expect(studentGrades.length).toBe(5);
    });

    it("should handle unmatched students gracefully and return error list", async () => {
      const useCase = new AdminImportMeshGradesUseCase(gradeRepository, userRepository);

      const csvData = `Класс, ФИО Ученика, Предмет, Оценки, Период
10А, Несуществующий Иван, Алгебра, "5(1) 4(1)", 1 триместр`;

      const result = await useCase.execute({ csvData });

      expect(result.isSuccess).toBe(true);
      expect(result.value.matchedStudentsCount).toBe(0);
      expect(result.value.importedGradesCount).toBe(0);
      expect(result.value.unmatchedStudents.length).toBe(1);
      expect(result.value.unmatchedStudents[0]).toContain("Несуществующий Иван");
    });
  });

  describe("GetStudentGradesUseCase", () => {
    it("should return subject summaries for student and period", async () => {
      const g1 = new Grade("g-1", testStudent.id, "sub-1", "Геометрия", 5, 1, "2026-10-01", "1 триместр");
      const g2 = new Grade("g-2", testStudent.id, "sub-1", "Геометрия", 4, 1, "2026-10-02", "1 триместр");
      await gradeRepository.saveBatch([g1, g2]);

      const useCase = new GetStudentGradesUseCase(gradeRepository);
      const result = await useCase.execute({ studentId: testStudent.id, period: "1 триместр" });

      expect(result.isSuccess).toBe(true);
      const summaries = result.value;
      expect(summaries.length).toBe(1);
      expect(summaries[0].subjectName).toBe("Геометрия");
      expect(summaries[0].averageScore).toBe(4.5);
    });
  });
});

