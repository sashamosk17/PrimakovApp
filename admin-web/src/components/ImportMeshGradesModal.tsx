import React, { useState, useMemo } from "react";
import { ALL_GYMNASIUM_CLASSES } from "../pages/ScheduleView";
import { apiClient } from "../api/client";
import { useLanguage } from "../context/LanguageContext";

interface ImportMeshGradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ParsedPreviewRow {
  group: string;
  studentName: string;
  subject: string;
  grades: string;
  period: string;
  gradeCount: number;
}

export const ImportMeshGradesModal: React.FC<ImportMeshGradesModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t, language } = useLanguage();
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1 триместр");
  const [csvText, setCsvText] = useState<string>(
    `Класс, ФИО Ученика, Предмет, Оценки, Период\n10-А, Орлов Андрей, Алгебра, "5(1) 4(1) 5(2)", 1 триместр\n10-А, Орлов Андрей, Физика, "5(1.5) 4(1)", 1 триместр\n11-Б, Смирнов Даниил, Обществознание, "5(1) 5(2)", 1 триместр`
  );
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultAlert, setResultAlert] = useState<{
    type: "success" | "error";
    message: string;
    details?: string[];
  } | null>(null);

  // Parse CSV text for live preview
  const previewRows = useMemo<ParsedPreviewRow[]>(() => {
    if (!csvText.trim()) return [];
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length <= 1) return [];

    const rows: ParsedPreviewRow[] = [];
    let startIndex = 0;
    const firstLineLower = lines[0].toLowerCase();
    if (
      firstLineLower.includes("класс") ||
      firstLineLower.includes("ученик") ||
      firstLineLower.includes("предмет")
    ) {
      startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV regex parse
      const cols: string[] = [];
      let cur = "";
      let inQuotes = false;
      const delim = line.includes(";") && !line.includes(",") ? ";" : ",";

      for (let j = 0; j < line.length; j++) {
        const c = line[j];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === delim && !inQuotes) {
          cols.push(cur.trim());
          cur = "";
        } else {
          cur += c;
        }
      }
      cols.push(cur.trim());

      if (cols.length >= 4) {
        const group = cols[0];
        const studentName = cols[1];
        const subject = cols[2];
        const grades = cols[3];
        const period = cols[4] || selectedPeriod;

        if (selectedClass !== "ALL" && group.trim() !== selectedClass.trim()) {
          continue;
        }

        const gradeMatches = grades.match(/([2-5])(?:\(([0-9.]+)\))?/g);
        const count = gradeMatches ? gradeMatches.length : 0;

        rows.push({
          group,
          studentName,
          subject,
          grades,
          period,
          gradeCount: count,
        });
      }
    }
    return rows;
  }, [csvText, selectedClass, selectedPeriod]);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      readFileContent(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      readFileContent(e.target.files[0]);
    }
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvText(text);
        setResultAlert(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultAlert(null);
    setLoading(true);

    try {
      const response = await apiClient.post("/admin/grades/import", {
        csvData: csvText,
        defaultPeriod: selectedPeriod,
        classFilter: selectedClass === "ALL" ? undefined : selectedClass,
      });

      const resData = response.data?.data;
      const count = resData?.importedGradesCount ?? 0;
      const matched = resData?.matchedStudentsCount ?? 0;
      const unmatched = resData?.unmatchedStudents ?? [];
      const errors = resData?.errors ?? [];

      setResultAlert({
        type: "success",
        message: `Успешно импортировано оценок: ${count} для ${matched} учеников.`,
        details: [
          ...(unmatched.length > 0 ? [`Не найдены в базе: ${unmatched.join(", ")}`] : []),
          ...(errors.length > 0 ? errors : []),
        ],
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error?.message ||
        err.message ||
        "Ошибка при импорте ведомости МЭШ";
      setResultAlert({
        type: "error",
        message: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <div className="glass-modal animate-modal-pop rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-white/60 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-primary font-bold">
              <span className="material-symbols-outlined text-2xl">grade</span>
            </div>
            <div>
              <h3 className="text-xl font-extrabold font-headline text-on-surface">
                {t("modals.importMesh")}
              </h3>
              <p className="text-xs text-secondary">
                {language === "en" ? "Batch import grades and calculate weighted GPA" : "Пакетная загрузка оценок и расчет средневзвешенного GPA"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {resultAlert && (
          <div
            className={`mt-4 p-4 rounded-2xl border ${
              resultAlert.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <span className="material-symbols-outlined text-lg">
                {resultAlert.type === "success" ? "check_circle" : "error"}
              </span>
              <span>{resultAlert.message}</span>
            </div>
            {resultAlert.details && resultAlert.details.length > 0 && (
              <ul className="mt-2 text-xs opacity-90 list-disc list-inside space-y-0.5">
                {resultAlert.details.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleImportSubmit} className="mt-5 space-y-5">
          {/* Controls: Class and Period Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {language === "en" ? "Gymnasium Class" : "Класс гимназии"}
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-on-surface focus:outline-none focus:border-primary transition-all cursor-pointer"
              >
                <option value="ALL">{language === "en" ? "All classes in file" : "Все классы из файла"}</option>
                {ALL_GYMNASIUM_CLASSES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {language === "en" ? "Academic Term" : "Учебный период"}
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-on-surface focus:outline-none focus:border-primary transition-all cursor-pointer"
              >
                <option value="1 триместр">{language === "en" ? "Term 1" : "1 триместр"}</option>
                <option value="2 триместр">{language === "en" ? "Term 2" : "2 триместр"}</option>
                <option value="3 триместр">{language === "en" ? "Term 3" : "3 триместр"}</option>
                <option value="Итог">{language === "en" ? "Final Assessment" : "Итоговая аттестация"}</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
            }`}
          >
            <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">
              upload_file
            </span>
            <p className="text-xs font-semibold text-slate-600">
              {language === "en" ? "Drag & drop MES CSV file here or " : "Перетащите CSV-файл отчета МЭШ сюда или "}
              <label className="text-primary hover:underline cursor-pointer">
                {language === "en" ? "browse files" : "выберите файл"}
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {language === "en" ? "Format: Class, Student Name, Subject, Weighted Grades (\"5(1) 4(1.5) 5(2)\")" : "Формат: Класс, ФИО Ученика, Предмет, Оценки с весами (\"5(1) 4(1.5) 5(2)\")"}
            </p>
          </div>

          {/* Manual Textarea */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {language === "en" ? "CSV Content (editable)" : "Содержимое CSV (редактируемое)"}
              </label>
              <span className="text-[11px] text-slate-400">
                {language === "en" ? `Lines: ${csvText.trim().split("\n").length}` : `Строк: ${csvText.trim().split("\n").length}`}
              </span>
            </div>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setResultAlert(null);
              }}
              placeholder='10-А, Орлов Андрей, Алгебра, "5(1) 4(1.5) 5(2)", 1 триместр'
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 focus:outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Live Preview Table */}
          {previewRows.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {language === "en" ? `Data Preview (${previewRows.length} rows)` : `Предпросмотр данных (${previewRows.length} записей)`}
                </span>
                <span className="text-[11px] font-bold text-primary">
                  {language === "en" ? `Total grades: ${previewRows.reduce((acc, r) => acc + r.gradeCount, 0)}` : `Всего оценок: ${previewRows.reduce((acc, r) => acc + r.gradeCount, 0)}`}
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2">{language === "en" ? "Class" : "Класс"}</th>
                      <th className="px-3 py-2">{language === "en" ? "Student" : "Ученик"}</th>
                      <th className="px-3 py-2">{language === "en" ? "Subject" : "Предмет"}</th>
                      <th className="px-3 py-2">{language === "en" ? "Grades" : "Оценки"}</th>
                      <th className="px-3 py-2 text-right">{language === "en" ? "Count" : "Кол-во"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-3 py-2 font-bold text-primary whitespace-nowrap">
                          {row.group}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-800 whitespace-nowrap">
                          {row.studentName}
                        </td>
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                          {row.subject}
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-700">
                          {row.grades}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-700">
                          {row.gradeCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t("modals.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading || previewRows.length === 0}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin text-sm">⏳</span>
                  {language === "en" ? "Importing..." : "Импорт..."}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">cloud_upload</span>
                  {language === "en" ? "Import into System" : "Импортировать в систему"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

