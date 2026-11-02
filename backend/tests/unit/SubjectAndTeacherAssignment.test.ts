import { Subject } from "../../src/domain/entities/Subject";
import { MockSubjectRepository } from "../../src/infrastructure/database/memory/MockSubjectRepository";
import { CreateSubjectUseCase } from "../../src/application/admin/CreateSubjectUseCase";
import { GetSubjectsUseCase } from "../../src/application/admin/GetSubjectsUseCase";
import { DeleteSubjectUseCase } from "../../src/application/admin/DeleteSubjectUseCase";
import { AssignTeacherSubjectUseCase } from "../../src/application/admin/AssignTeacherSubjectUseCase";
import { RemoveTeacherSubjectUseCase } from "../../src/application/admin/RemoveTeacherSubjectUseCase";
import { GetTeacherSubjectsUseCase } from "../../src/application/admin/GetTeacherSubjectsUseCase";
import { randomUUID } from "crypto";

describe("Subject & Teacher Assignment Use Cases", () => {
  let subjectRepo: MockSubjectRepository;
  let createSubjectUseCase: CreateSubjectUseCase;
  let getSubjectsUseCase: GetSubjectsUseCase;
  let deleteSubjectUseCase: DeleteSubjectUseCase;
  let assignTeacherSubjectUseCase: AssignTeacherSubjectUseCase;
  let removeTeacherSubjectUseCase: RemoveTeacherSubjectUseCase;
  let getTeacherSubjectsUseCase: GetTeacherSubjectsUseCase;

  beforeEach(() => {
    subjectRepo = new MockSubjectRepository();
    createSubjectUseCase = new CreateSubjectUseCase(subjectRepo);
    getSubjectsUseCase = new GetSubjectsUseCase(subjectRepo);
    deleteSubjectUseCase = new DeleteSubjectUseCase(subjectRepo);
    assignTeacherSubjectUseCase = new AssignTeacherSubjectUseCase(subjectRepo);
    removeTeacherSubjectUseCase = new RemoveTeacherSubjectUseCase(subjectRepo);
    getTeacherSubjectsUseCase = new GetTeacherSubjectsUseCase(subjectRepo);
  });

  describe("Subjects CRUD", () => {
    it("creates a new subject successfully", async () => {
      const result = await createSubjectUseCase.execute({
        name: "Информатика и ИИ",
        description: "Основы программирования и машинного обучения",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value.id).toBeDefined();
      expect(result.value.name).toBe("Информатика и ИИ");
      expect(result.value.description).toBe("Основы программирования и машинного обучения");
    });

    it("prevents creating duplicate subject names", async () => {
      await createSubjectUseCase.execute({ name: "Физика" });
      const dupResult = await createSubjectUseCase.execute({ name: "Физика" });

      expect(dupResult.isFailure).toBe(true);
      expect(dupResult.error).toContain("already exists");
    });

    it("lists all created subjects", async () => {
      await createSubjectUseCase.execute({ name: "Алгебра" });
      await createSubjectUseCase.execute({ name: "Геометрия" });

      const result = await getSubjectsUseCase.execute();
      expect(result.isSuccess).toBe(true);
      expect(result.value.length).toBeGreaterThanOrEqual(2);
      expect(result.value.some((s: Subject) => s.name === "Алгебра")).toBe(true);
      expect(result.value.some((s: Subject) => s.name === "Геометрия")).toBe(true);
    });

    it("deletes a subject by ID", async () => {
      const created = await createSubjectUseCase.execute({ name: "Астрономия" });
      expect(created.isSuccess).toBe(true);

      const delResult = await deleteSubjectUseCase.execute(created.value.id);
      expect(delResult.isSuccess).toBe(true);

      const subjects = await getSubjectsUseCase.execute();
      expect(subjects.value.some((s: Subject) => s.id === created.value.id)).toBe(false);
    });
  });

  describe("Teacher-Subject Assignments (020 migration)", () => {
    it("assigns teacher to subject and retrieves assignments", async () => {
      const teacherId = randomUUID();
      const subject = (await createSubjectUseCase.execute({ name: "Органическая химия" })).value;

      const assignResult = await assignTeacherSubjectUseCase.execute({
        teacherId,
        subjectId: subject.id,
      });

      expect(assignResult.isSuccess).toBe(true);

      const teacherSubjects = await getTeacherSubjectsUseCase.execute(teacherId);
      expect(teacherSubjects.isSuccess).toBe(true);
      expect(teacherSubjects.value).toHaveLength(1);
      expect(teacherSubjects.value[0].name).toBe("Органическая химия");
    });

    it("removes teacher-subject assignment", async () => {
      const teacherId = randomUUID();
      const subject = (await createSubjectUseCase.execute({ name: "Молекулярная биология" })).value;

      await assignTeacherSubjectUseCase.execute({ teacherId, subjectId: subject.id });
      const removeResult = await removeTeacherSubjectUseCase.execute({
        teacherId,
        subjectId: subject.id,
      });

      expect(removeResult.isSuccess).toBe(true);

      const teacherSubjects = await getTeacherSubjectsUseCase.execute(teacherId);
      expect(teacherSubjects.isSuccess).toBe(true);
      expect(teacherSubjects.value).toHaveLength(0);
    });
  });
});
