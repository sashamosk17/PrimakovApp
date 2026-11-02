import React, { useState, useEffect } from "react";
import type { User, Role } from "../types";
import { ALL_GYMNASIUM_CLASSES } from "../pages/ScheduleView";

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (id: string, updatedData: any) => Promise<void>;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSubmit,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [groupName, setGroupName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setRole(user.role || "STUDENT");
      setGroupName(user.groupName || "");
      setIsActive(user.isActive !== false);
      setBirthDate(user.birthDate ? user.birthDate.split("T")[0] : "");
      setPhone(user.phone || "");
      setTelegram(user.telegram || "");
      setNewPassword("");
      setError(null);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      setError("Имя, фамилия и email обязательны для заполнения");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const payload: any = {
        firstName,
        lastName,
        email,
        role,
        groupName: role === "STUDENT" ? groupName : undefined,
        isActive,
        birthDate: birthDate ? birthDate : null,
        phone: phone ? phone : null,
        telegram: telegram ? telegram : null,
      };
      if (newPassword && newPassword.trim().length >= 6) {
        payload.newPassword = newPassword.trim();
      }
      await onSubmit(user.id, payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err.message || "Не удалось сохранить изменения");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="glass-modal dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-5 animate-modal-pop">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold font-headline text-on-surface">
              Редактирование профиля
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ID: {user.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                Имя
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                Фамилия
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
              Корпоративный Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                Роль в гимназии
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              >
                <option value="STUDENT">Ученик (Student)</option>
                <option value="TEACHER">Преподаватель (Teacher)</option>
                <option value="ADMIN">Администратор (Admin)</option>
                <option value="SUPERADMIN">Директорат (Superadmin)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                Закрепленный класс
              </label>
              <select
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                disabled={role !== "STUDENT"}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium disabled:opacity-50"
              >
                <option value="">Без класса</option>
                {ALL_GYMNASIUM_CLASSES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.specialization ? `(${c.specialization})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                Дата рождения
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium text-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                Телефон
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-mono text-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                Telegram
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-mono text-slate-700"
              />
            </div>
          </div>

          {/* Password Reset Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center mb-1.5">
              <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Сброс пароля (оставьте пустым, если не меняется)
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                Сгенерировать надежный
              </button>
            </div>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Новый временный пароль (мин. 6 символов)"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-primary focus:ring-0"
              />
              <span className="text-xs font-bold text-slate-700">Аккаунт активен</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-container shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

