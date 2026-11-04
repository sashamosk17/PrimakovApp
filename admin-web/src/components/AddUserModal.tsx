import React, { useState } from "react";
import type { Role } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    password: string;
  }) => Promise<void>;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t, language } = useLanguage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ firstName, lastName, email, role, password });
      onClose();
      setFirstName("");
      setLastName("");
      setEmail("");
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || (language === "en" ? "Creation error" : "Ошибка создания"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="glass-modal dark:bg-slate-900/90 rounded-3xl p-7 max-w-md w-full shadow-2xl animate-modal-pop">
        <div className="flex justify-between items-center mb-5">
          <h4 className="text-lg font-bold font-headline text-on-surface">
            {t("modals.addUser")}
          </h4>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                {t("modals.firstName")}
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={language === "en" ? "John" : "Иван"}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                {t("modals.lastName")}
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={language === "en" ? "Doe" : "Петров"}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              {t("modals.email")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@primakov.school"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              {t("modals.role")}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="STUDENT">{language === "en" ? "Student" : "Ученик (STUDENT)"}</option>
              <option value="TEACHER">{language === "en" ? "Teacher" : "Учитель (TEACHER)"}</option>
              <option value="ADMIN">{language === "en" ? "Administrator" : "Администратор (ADMIN)"}</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              {language === "en" ? "Temporary Password" : "Временный пароль"}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
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
              {loading
                ? (language === "en" ? "Creating..." : "Создание...")
                : (language === "en" ? "Create Account" : "Создать аккаунт")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
