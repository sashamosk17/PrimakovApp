import { Subject } from "../entities/Subject";
import { Result } from "../../shared/Result";

export interface TeacherAssignment {
  teacherId: string;
  subjectId: string;
  createdAt: Date;
  teacherName?: string;
  subjectName?: string;
}

export interface ISubjectRepository {
  findAll(): Promise<Result<Subject[]>>;
  findById(id: string): Promise<Subject | undefined>;
  findByName(name: string): Promise<Subject | undefined>;
  create(subject: Subject): Promise<Result<Subject>>;
  delete(id: string): Promise<Result<void>>;

  getTeacherSubjects(teacherId: string): Promise<Result<Subject[]>>;
  assignTeacherSubject(teacherId: string, subjectId: string): Promise<Result<void>>;
  removeTeacherSubject(teacherId: string, subjectId: string): Promise<Result<void>>;
  getAllAssignments(): Promise<Result<TeacherAssignment[]>>;
}

