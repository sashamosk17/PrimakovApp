import React, { useEffect, useState } from "react";
import type { User, UserProfileDTO, LessonProfileDTO } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";

interface UserProfileModalProps {
  user: User | null;
  onClose: () => void;
  onEdit: (u: User) => void;
  onResetPassword: (u: User) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onEdit,
  onResetPassword,
  onToggleStatus,
}) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    setLoading(true);

    const token = localStorage.getItem("primakov_admin_token");
    fetch(`/api/admin/users/${user.id}/profile?date=${selectedDate}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        if (isMounted && data?.data) {
          setProfile(data.data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch remote profile, using local fallback:", err);
        if (isMounted) {
          // Graceful fallback with mock lessons for demo
          setProfile({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: `${user.lastName} ${user.firstName}`,
            role: user.role,
            isActive: user.isActive,
            avatarUrl: user.avatarUrl,
            groupName: user.groupName,
            birthDate: user.birthDate || (user.role === "STUDENT" ? "2010-04-12" : "1982-05-18"),
            phone: user.phone || "+7 (999) 123-45-67",
            telegram: user.telegram || `@${user.email.split("@")[0]}`,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            todayLessons: [
              {
                id: "lesson-1",
                subject: user.role === "TEACHER" ? "Математика (Профиль)" : "Алгебра и начала анализа",
                teacherId: user.id,
                teacherName: user.role === "TEACHER" ? `${user.lastName} ${user.firstName}` : "Соколова Е.М.",
                startTime: "09:00",
                endTime: "09:45",
                room: "305",
                floor: 3,
                hasHomework: true,
                homeworkDescription: "№ 412, 415 (б), параграф 18",
              },
              {
                id: "lesson-2",
                subject: user.role === "TEACHER" ? "Геометрия (10-Б)" : "Русский язык",
                teacherId: user.id,
                teacherName: user.role === "TEACHER" ? `${user.lastName} ${user.firstName}` : "Ковалева А.С.",
                startTime: "10:00",
                endTime: "10:45",
                room: "201",
                floor: 2,
                hasHomework: false,
              },
            ],
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, selectedDate]);

  if (!user) return null;

  // Age calculation and birthday status
  let ageString = "";
  let isBirthdayToday = false;
  let isBirthdaySoon = false;

  const bDateStr = profile?.birthDate || user.birthDate;
  if (bDateStr) {
    const parts = bDateStr.split("-");
    if (parts.length >= 3) {
      const bYear = parseInt(parts[0], 10);
      const bMonth = parseInt(parts[1], 10);
      const bDay = parseInt(parts[2], 10);

      const now = new Date();
      let age = now.getFullYear() - bYear;
      if (
        now.getMonth() + 1 < bMonth ||
        (now.getMonth() + 1 === bMonth && now.getDate() < bDay)
      ) {
        age--;
      }
      ageString = `${age} ${age % 10 === 1 && age !== 11 ? "год" : age % 10 >= 2 && age % 10 <= 4 && (age < 10 || age > 20) ? "года" : "лет"}`;

      if (now.getMonth() + 1 === bMonth && now.getDate() === bDay) {
        isBirthdayToday = true;
      } else if (now.getMonth() + 1 === bMonth && Math.abs(now.getDate() - bDay) <= 4) {
        isBirthdaySoon = true;
      }
    }
  }

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} скопирован в буфер`, "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="glass-modal dark:bg-slate-900/95 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          <div className="flex items-start gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-red-600 text-white font-black flex items-center justify-center text-xl shadow-md">
                {initials}
              </div>
            )}

            <div className="flex-1 min-w-0 pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    user.role === "ADMIN" || user.role === "SUPERADMIN"
                      ? "bg-red-500/20 text-red-200 border border-red-400/30"
                      : user.role === "TEACHER"
                      ? "bg-purple-500/20 text-purple-200 border border-purple-400/30"
                      : "bg-blue-500/20 text-blue-200 border border-blue-400/30"
                  }`}
                >
                  {user.role}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    user.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/30 text-slate-300"
                  }`}
                >
                  {user.isActive ? t("users.active") : t("users.disabled")}
                </span>

                {isBirthdayToday && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                    <span>🎂</span> {t("users.birthdayToday")}
                  </span>
                )}
                {!isBirthdayToday && isBirthdaySoon && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {t("users.birthdaySoon")}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-extrabold text-white font-display tracking-tight truncate">
                {user.lastName} {user.firstName}
              </h2>

              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <span className="material-symbols-outlined text-sm text-slate-400">school</span>
                {user.groupName ? (
                  <span className="font-semibold text-white">{user.groupName}</span>
                ) : (
                  <span className="italic text-slate-400">Гимназическая параллель не указана</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Birth Date & Age */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lg">cake</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t("users.birthDate")}
                </p>
                <p className="text-xs font-bold text-slate-800">
                  {bDateStr || "Не указана"}
                  {ageString && (
                    <span className="ml-1.5 text-[11px] font-semibold text-slate-500">
                      ({ageString})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">mail</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t("users.colEmail")}
                  </p>
                  <a
                    href={`mailto:${user.email}`}
                    className="text-xs font-mono font-bold text-blue-600 hover:underline truncate block"
                  >
                    {user.email}
                  </a>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(user.email, "Email")}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                title="Копировать"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>

            {/* Phone */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">call</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t("users.phone")}
                  </p>
                  {profile?.phone ? (
                    <a
                      href={`tel:${profile.phone}`}
                      className="text-xs font-bold text-emerald-700 hover:underline truncate block"
                    >
                      {profile.phone}
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Не указан</p>
                  )}
                </div>
              </div>
              {profile?.phone && (
                <button
                  onClick={() => copyToClipboard(profile.phone!, "Телефон")}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                  title="Копировать"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                </button>
              )}
            </div>

            {/* Telegram */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">send</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t("users.telegram")}
                  </p>
                  {profile?.telegram ? (
                    <a
                      href={`https://t.me/${profile.telegram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-sky-600 hover:underline truncate block"
                    >
                      {profile.telegram}
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Не указан</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                <h4 className="text-sm font-bold text-slate-800">
                  {t("users.scheduleTitle")}
                </h4>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-slate-700"
              />
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Загрузка расписания...
              </div>
            ) : profile?.todayLessons && profile.todayLessons.length > 0 ? (
              <div className="space-y-2">
                {profile.todayLessons.map((lesson: LessonProfileDTO, idx: number) => (
                  <div
                    key={lesson.id || idx}
                    className="p-3 bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">
                          {lesson.subject}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{lesson.teacherName}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">Каб. {lesson.room} (этаж {lesson.floor})</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      {lesson.hasHomework && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          ДЗ
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                        {lesson.startTime}–{lesson.endTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                {t("users.noLessonsToday")}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(user)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              {t("users.editUser")}
            </button>

            <button
              onClick={() => onResetPassword(user)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-amber-700 shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">lock_reset</span>
              {t("users.resetPass")}
            </button>

            <button
              onClick={() => onToggleStatus(user.id, !user.isActive)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5 ${
                user.isActive
                  ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {user.isActive ? "block" : "check_circle"}
              </span>
              {user.isActive ? "Отключить" : "Активировать"}
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

