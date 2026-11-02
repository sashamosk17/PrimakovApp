import { ISubjectRepository, TeacherAssignment } from "../../../domain/repositories/ISubjectRepository";
import { Subject } from "../../../domain/entities/Subject";
import { Result } from "../../../shared/Result";
import { randomUUID } from "crypto";

export class MockSubjectRepository implements ISubjectRepository {
  private subjects: Subject[] = [];
  private assignments: TeacherAssignment[] = [];

  constructor() {
    this.seedDefaultSubjects();
  }

  private seedDefaultSubjects() {
    const defaults = [
      { name: "Математика", desc: "Алгебра, геометрия и мат. анализ" },
      { name: "Русский язык", desc: "Грамматика, орфография и пунктуация" },
      { name: "Литература", desc: "Классическая и современная литература" },
      { name: "История", desc: "История России и всеобщая история" },
      { name: "Физика", desc: "Механика, оптика, термодинамика" },
      { name: "Химия", desc: "Органическая и неорганическая химия" },
      { name: "Информатика", desc: "Алгоритмы и основы программирования" },
      { name: "Биология", desc: "Анатомия, ботаника и общая биология" },
      { name: "Английский язык", desc: "Иностранный язык и аудирование" },
      { name: "Обществознание", desc: "Право, социология и экономика" },
    ];

    defaults.forEach((d) => {
      this.subjects.push(new Subject(randomUUID(), d.name, d.desc));
    });
  }

  async findAll(): Promise<Result<Subject[]>> {
    return Result.ok([...this.subjects]);
  }

  async findById(id: string): Promise<Subject | undefined> {
    return this.subjects.find((s) => s.id === id);
  }

  async findByName(name: string): Promise<Subject | undefined> {
    return this.subjects.find(
      (s) => s.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
  }

  async create(subject: Subject): Promise<Result<Subject>> {
    const exists = await this.findByName(subject.name);
    if (exists) {
      return Result.fail(`Subject with name '${subject.name}' already exists`);
    }
    this.subjects.push(subject);
    return Result.ok(subject);
  }

  async delete(id: string): Promise<Result<void>> {
    const idx = this.subjects.findIndex((s) => s.id === id);
    if (idx === -1) {
      return Result.fail("Subject not found");
    }
    this.subjects.splice(idx, 1);
    this.assignments = this.assignments.filter((a) => a.subjectId !== id);
    return Result.ok();
  }

  async getTeacherSubjects(teacherId: string): Promise<Result<Subject[]>> {
    const assignedSubjectIds = this.assignments
      .filter((a) => a.teacherId === teacherId)
      .map((a) => a.subjectId);

    const result = this.subjects.filter((s) => assignedSubjectIds.includes(s.id));
    return Result.ok(result);
  }

  async assignTeacherSubject(teacherId: string, subjectId: string): Promise<Result<void>> {
    const subject = await this.findById(subjectId);
    if (!subject) {
      return Result.fail("Subject not found");
    }

    const alreadyAssigned = this.assignments.some(
      (a) => a.teacherId === teacherId && a.subjectId === subjectId
    );
    if (alreadyAssigned) {
      return Result.ok();
    }

    this.assignments.push({
      teacherId,
      subjectId,
      createdAt: new Date(),
      subjectName: subject.name,
    });
    return Result.ok();
  }

  async removeTeacherSubject(teacherId: string, subjectId: string): Promise<Result<void>> {
    this.assignments = this.assignments.filter(
      (a) => !(a.teacherId === teacherId && a.subjectId === subjectId)
    );
    return Result.ok();
  }

  async getAllAssignments(): Promise<Result<TeacherAssignment[]>> {
    return Result.ok([...this.assignments]);
  }
}

