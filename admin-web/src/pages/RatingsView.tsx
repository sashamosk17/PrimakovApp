import React, { useState, useMemo } from "react";
import type { TeacherRating, User } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";

interface RatingsViewProps {
  ratings: TeacherRating[];
  teachers?: User[];
  allUsers?: User[];
  onModerateRating?: (id: string, status: "APPROVED" | "HIDDEN") => Promise<void>;
  onDeleteRating?: (id: string) => Promise<void>;
}

export const RatingsView: React.FC<RatingsViewProps> = ({
  ratings,
  teachers = [],
  allUsers = [],
  onModerateRating,
  onDeleteRating,
}) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [selectedTeacher, setSelectedTeacher] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [minRating, setMinRating] = useState<number>(0);

  const getTeacherName = (teacherId: string) => {
    const t = teachers.find((teach) => teach.id === teacherId);
    if (t) return `${t.firstName} ${t.lastName}`;
    return teacherId.slice(0, 8);
  };

  const getAuthorDisplay = (userId: string) => {
    const u = allUsers.find((user) => user.id === userId);
    if (u) {
      if (u.groupName) return `${u.firstName} ${u.lastName} (${u.groupName})`;
      return `${u.firstName} ${u.lastName}`;
    }
    return `Ученик (${userId.slice(0, 6)})`;
  };

  const filtered = useMemo(() => {
    return ratings.filter((r) => {
      if (selectedTeacher !== "ALL" && r.teacherId !== selectedTeacher) return false;
      if (selectedStatus !== "ALL" && (r.status || "APPROVED") !== selectedStatus) return false;
      if (minRating > 0 && r.value < minRating) return false;
      return true;
    });
  }, [ratings, selectedTeacher, selectedStatus, minRating]);

  const handleModerate = async (id: string, status: "APPROVED" | "HIDDEN") => {
    if (onModerateRating) {
      await onModerateRating(id, status);
      showToast(status === "APPROVED" ? "Отзыв опубликован" : "Отзыв скрыт от общего доступа", "info");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Удалить данный отзыв безвозвратно?")) {
      if (onDeleteRating) {
        await onDeleteRating(id);
        showToast("Отзыв удален", "success");
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-on-surface font-display tracking-tight">
            {t("ratings.title")}
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            {t("ratings.subtitle")} • Всего отзывов: {ratings.length}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-3xl shadow-xs border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Teacher selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {t("ratings.teacher")}:
            </span>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-on-surface focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option value="ALL">{t("ratings.filterTeacher")}</option>
              {teachers.map((teach) => (
                <option key={teach.id} value={teach.id}>
                  {teach.firstName} {teach.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {t("ratings.status")}:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-on-surface focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Все статусы</option>
              <option value="APPROVED">Одобренные (Approved)</option>
              <option value="HIDDEN">Скрытые (Hidden)</option>
            </select>
          </div>

          {/* Star Rating filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Оценка:
            </span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="bg-transparent border-none text-xs font-bold text-on-surface focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option value={0}>{t("ratings.allRatings")}</option>
              <option value={8}>★ 8 и выше (Отличные)</option>
              <option value={5}>★ 5 и выше</option>
              <option value={1}>Все (от 1 звезды)</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Отобрано: <strong className="text-on-surface">{filtered.length}</strong>
        </span>
      </div>

      {/* Ratings Table */}
      <div className="bg-surface-container-lowest rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="py-3.5 px-6">{t("ratings.teacher")}</th>
              <th className="py-3.5 px-4">{t("ratings.author")}</th>
              <th className="py-3.5 px-4">{t("ratings.score")}</th>
              <th className="py-3.5 px-4">{t("ratings.comment")}</th>
              <th className="py-3.5 px-4">{t("ratings.status")}</th>
              <th className="py-3.5 px-6 text-right">Модерация</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Рейтинги по выбранным критериям отсутствуют
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const status = r.status || "APPROVED";
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-on-surface">
                        {r.teacherName || getTeacherName(r.teacherId)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ID: {r.teacherId.slice(0, 8)}...
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-700">
                      {r.userName || getAuthorDisplay(r.userId)}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${
                        r.value >= 8
                          ? "bg-green-50 text-green-800 border-green-200"
                          : r.value >= 5
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}>
                        ★ {r.value} / 10
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-700 max-w-sm leading-relaxed">
                      {r.comment ? (
                        <span>«{r.comment}»</span>
                      ) : (
                        <span className="text-slate-400 italic">Без текстового отзыва</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        status === "APPROVED"
                          ? "bg-green-50 text-green-700"
                          : status === "HIDDEN"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {status === "APPROVED" ? "Одобрен" : status === "HIDDEN" ? "Скрыт" : "На проверке"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {status !== "APPROVED" && (
                          <button
                            onClick={() => handleModerate(r.id, "APPROVED")}
                            title={t("ratings.approve")}
                            className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            ✓ Одобрить
                          </button>
                        )}

                        {status !== "HIDDEN" && (
                          <button
                            onClick={() => handleModerate(r.id, "HIDDEN")}
                            title={t("ratings.hide")}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Скрыть
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(r.id)}
                          title={t("ratings.delete")}
                          className="p-1 text-slate-400 hover:text-red-700 transition-colors rounded-lg hover:bg-slate-100 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
