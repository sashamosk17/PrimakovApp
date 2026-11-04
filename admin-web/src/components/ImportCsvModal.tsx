import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (users: any[]) => Promise<void>;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const { t, language } = useLanguage();
  const [csvText, setCsvText] = useState(
    `email,password,firstName,lastName,role\nandrey.orlov@primakov.school,Password123!,Андрей,Орлов,STUDENT\nalena.vasileva@primakov.school,Password123!,Алена,Васильева,STUDENT`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const lines = csvText.trim().split("\n");
      if (lines.length < 2) {
        throw new Error(language === "en" ? "CSV must contain a header and at least one user record" : "CSV должен содержать заголовок и хотя бы одну строку");
      }

      const users = [];
      // skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [email, password, firstName, lastName, role] = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
        if (!email || !firstName || !lastName) continue;
        users.push({
          email,
          password: password || "Password123!",
          firstName,
          lastName,
          role: role || "STUDENT",
        });
      }

      await onImport(users);
      onClose();
    } catch (err: any) {
      setError(err?.message || (language === "en" ? "CSV Parsing Error" : "Ошибка парсинга CSV"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-bold font-headline text-on-surface">
            {t("modals.importCsv")}
          </h4>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            ✕
          </button>
        </div>

        <p className="text-xs text-secondary mb-4 leading-relaxed">
          {language === "en" ? "Paste rows in CSV format:" : "Вставьте строки в формате:"} <code className="bg-slate-100 px-1 py-0.5 rounded text-primary">email,password,firstName,lastName,role</code>
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleImportSubmit} className="space-y-4">
          <textarea
            rows={7}
            required
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              {t("modals.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (language === "en" ? "Importing..." : "Импорт...") : (language === "en" ? "Start Import" : "Запустить импорт")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

