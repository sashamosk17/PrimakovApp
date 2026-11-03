import { randomUUID } from "crypto";
import { Grade } from "../../domain/entities/Grade";
import { IGradeRepository } from "../../domain/repositories/IGradeRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { Result } from "../../shared/Result";

export interface AdminImportMeshGradesRequest {
  csvData: string;
  defaultPeriod?: string;
  classFilter?: string;
}

export interface AdminImportMeshGradesResponse {
  importedGradesCount: number;
  matchedStudentsCount: number;
  unmatchedStudents: string[];
  errors: string[];
}

export class AdminImportMeshGradesUseCase {
  constructor(
    private readonly gradeRepository: IGradeRepository,
    private readonly userRepository: IUserRepository
  ) {}

  public async execute(
    request: AdminImportMeshGradesRequest
  ): Promise<Result<AdminImportMeshGradesResponse>> {
    try {
      const { csvData, defaultPeriod = "1 триместр", classFilter } = request;

      if (!csvData || !csvData.trim()) {
        return Result.fail("CSV data cannot be empty");
      }

      const studentsResult = await this.userRepository.findByRole("STUDENT");
      if (studentsResult.isFailure) {
        return Result.fail(studentsResult.error || "Failed to load students");
      }
      const students = studentsResult.value;

      const lines = csvData.trim().split(/\r?\n/);
      if (lines.length === 0) {
        return Result.fail("CSV contains no lines");
      }

      const normalizeGroup = (g?: string | null) =>
        (g || "").trim().toUpperCase().replace(/[A-Z]/g, (ch) => {
          // Normalise latin A, B, etc. to cyrillic А, Б if needed
          const map: Record<string, string> = { A: "А", B: "В", C: "С", E: "Е", H: "Н", K: "К", M: "М", O: "О", P: "Р", T: "Т", X: "Х" };
          return map[ch] || ch;
        });

      const normalizeName = (name: string) =>
        name.trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");

      const matchedStudentIds = new Set<string>();
      const unmatchedStudentsSet = new Set<string>();
      const errors: string[] = [];
      const gradesToSave: Grade[] = [];

      // Check if line 0 is a header row
      let startIndex = 0;
      const firstLineLower = lines[0].toLowerCase();
      if (
        firstLineLower.includes("класс") ||
        firstLineLower.includes("ученик") ||
        firstLineLower.includes("фио") ||
        firstLineLower.includes("предмет")
      ) {
        startIndex = 1;
      }

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV line taking quotes into account
        const columns = this.parseCsvLine(line);
        if (columns.length < 4) {
          errors.push(`Строка ${i + 1}: недостаточно колонок (${line})`);
          continue;
        }

        const rawClass = columns[0].trim();
        const rawStudentName = columns[1].trim();
        const rawSubject = columns[2].trim();
        const rawGrades = columns[3].trim();
        const rawPeriod = (columns[4] ? columns[4].trim() : "") || defaultPeriod;

        if (classFilter && normalizeGroup(rawClass) !== normalizeGroup(classFilter)) {
          continue;
        }

        // Find matching student
        const normTargetGroup = normalizeGroup(rawClass);
        const normTargetName = normalizeName(rawStudentName);

        const matchedStudent = students.find((s) => {
          const groupMatches = !s.groupName || normalizeGroup(s.groupName) === normTargetGroup;
          if (!groupMatches) return false;

          const lastFirst = normalizeName(`${s.lastName} ${s.firstName}`);
          const firstLast = normalizeName(`${s.firstName} ${s.lastName}`);

          return (
            normTargetName === lastFirst ||
            normTargetName === firstLast ||
            normTargetName.includes(lastFirst) ||
            lastFirst.includes(normTargetName)
          );
        });

        if (!matchedStudent) {
          unmatchedStudentsSet.add(`${rawClass} - ${rawStudentName}`);
          continue;
        }

        matchedStudentIds.add(matchedStudent.id);

        // Parse grades: e.g. "5(1) 4(1.5) 5(2)" or "5 4 5" or "5(2), 4(1)"
        const gradeTokens = rawGrades.match(/([2-5])(?:\(([0-9.]+)\))?/g);
        if (!gradeTokens || gradeTokens.length === 0) {
          continue;
        }

        for (const token of gradeTokens) {
          const m = token.match(/([2-5])(?:\(([0-9.]+)\))?/);
          if (!m) continue;

          const value = parseInt(m[1], 10);
          const weight = m[2] ? parseFloat(m[2]) : 1.0;

          gradesToSave.push(
            new Grade(
              randomUUID(),
              matchedStudent.id,
              this.slugify(rawSubject),
              rawSubject,
              value,
              weight,
              new Date().toISOString(),
              rawPeriod
            )
          );
        }
      }

      if (gradesToSave.length > 0) {
        await this.gradeRepository.saveBatch(gradesToSave);
      }

      return Result.ok<AdminImportMeshGradesResponse>({
        importedGradesCount: gradesToSave.length,
        matchedStudentsCount: matchedStudentIds.size,
        unmatchedStudents: Array.from(unmatchedStudentsSet),
        errors,
      });
    } catch (err: any) {
      return Result.fail(err.message || "Failed to import Mesh grades");
    }
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    const delimiter = line.includes(";") && !line.includes(",") ? ";" : ",";

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-zа-я0-9]/gi, "-")
      .replace(/-+/g, "-");
  }
}
