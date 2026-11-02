import React, { useState } from "react";
import type { DashboardMetrics, ActivityPoint, ServiceRequest, Announcement } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface DashboardViewProps {
  metrics: DashboardMetrics;
  weeklyActivity: ActivityPoint[];
  recentRequests: ServiceRequest[];
  announcements: Announcement[];
  onOpenAddUser: () => void;
  onOpenCreateAnnouncement: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  weeklyActivity,
  recentRequests,
  announcements,
  onOpenAddUser,
  onOpenCreateAnnouncement,
  onNavigateTab,
}) => {
  const { t } = useLanguage();
  const [activityRole, setActivityRole] = useState<"STUDENTS" | "TEACHERS">("STUDENTS");

  const displayedActivity = weeklyActivity.map((p) => ({
    day: p.day,
    count: activityRole === "TEACHERS" ? Math.max(8, Math.round(p.count * 0.28)) : p.count,
  }));
  return (
    <div className="space-y-8 academic-sketch-bg pb-12">
      {/* Hero Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h3 className="text-3xl lg:text-4xl font-extrabold text-on-surface font-display tracking-tight">
            Институциональный Обзор
          </h3>
          <p className="text-secondary font-medium mt-1 text-sm">
            Добро пожаловать в административную панель Гимназии им. Примакова.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl flex items-center gap-3 shadow-sm border border-slate-100">
            <div className="bg-primary/10 text-primary p-2 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">event</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Учебный период
              </p>
              <p className="text-xs font-bold text-on-surface">
                Осенний семестр 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl flex flex-col justify-between h-40 shadow-sm border border-slate-100/60 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary text-2xl">
              groups
            </span>
            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              +4.2%
            </span>
          </div>
          <div>
            <h4 className="text-3xl font-black text-on-surface font-headline">
              {metrics.totalStudents || 847}
            </h4>
            <p className="text-xs text-secondary font-semibold mt-0.5">
              Всего учащихся
            </p>
          </div>
        </div>

        {/* Active Requests */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl flex flex-col justify-between h-40 shadow-sm border border-slate-100/60 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary text-2xl">
              pending_actions
            </span>
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              В работе
            </span>
          </div>
          <div>
            <h4 className="text-3xl font-black text-on-surface font-headline">
              {metrics.activeRequests}
            </h4>
            <p className="text-xs text-secondary font-semibold mt-0.5">
              Активных сервисных заявок
            </p>
          </div>
        </div>

        {/* CSI Index */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl flex flex-col justify-between h-40 shadow-sm border border-slate-100/60 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary text-2xl">
              star
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Цель: 5.0
            </span>
          </div>
          <div>
            <h4 className="text-3xl font-black text-on-surface font-headline">
              {metrics.csiIndex || 4.8}
            </h4>
            <p className="text-xs text-secondary font-semibold mt-0.5">
              Индекс CSI (Рейтинг учителей)
            </p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl flex flex-col justify-between h-40 shadow-sm border border-slate-100/60 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary text-2xl">
              calendar_month
            </span>
            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              В норме
            </span>
          </div>
          <div>
            <h4 className="text-3xl font-black text-on-surface font-headline">
              {metrics.attendanceRate || 94.2}%
            </h4>
            <p className="text-xs text-secondary font-semibold mt-0.5">
              Посещаемость занятий
            </p>
          </div>
        </div>
      </section>

      {/* Main Data Layer */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Weekly Trends & Recent Requests */}
        <div className="lg:col-span-8 space-y-8">
          {/* Weekly Trends Chart */}
          <div className="bg-surface-container-low p-8 rounded-4xl border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-lg font-bold font-headline text-on-surface">
                  Недельная активность экосистемы
                </h4>
                <p className="text-xs text-secondary">
                  Количество обращений и заходов в приложение
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActivityRole("STUDENTS")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activityRole === "STUDENTS"
                      ? "bg-white text-on-surface shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t("dash.students")}
                </button>
                <button
                  onClick={() => setActivityRole("TEACHERS")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activityRole === "TEACHERS"
                      ? "bg-white text-on-surface shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t("dash.teachers")}
                </button>
              </div>
            </div>

            {/* Interactive Visual Bar Chart */}
            <div className="h-56 w-full flex items-end justify-between gap-4 px-2">
              {displayedActivity.map((point, index) => {
                const maxVal = Math.max(...displayedActivity.map((p) => p.count), 100);
                const heightPct = Math.round((point.count / maxVal) * 100);
                const isPeak = point.count === Math.max(...displayedActivity.map((p) => p.count));
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-red-950 transition-opacity bg-white px-1.5 py-0.5 rounded shadow">
                      {point.count}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        isPeak
                          ? "bg-primary shadow-lg shadow-primary/25"
                          : "bg-primary/30 group-hover:bg-primary/60"
                      }`}
                    ></div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {point.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Student Requests Table */}
          <div className="bg-surface-container-lowest p-8 rounded-4xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-lg font-bold font-headline text-on-surface">
                  Недавние сервисные заявки
                </h4>
                <p className="text-xs text-secondary">
                  IT, техническое обслуживание и клининг
                </p>
              </div>
              <button
                onClick={() => onNavigateTab("requests")}
                className="text-primary text-xs font-bold hover:underline cursor-pointer"
              >
                Все заявки →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="pb-3">Заявка / Тема</th>
                    <th className="pb-3">Категория</th>
                    <th className="pb-3">Приоритет</th>
                    <th className="pb-3">Статус</th>
                    <th className="pb-3 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50">
                  {recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                        Нет активных заявок
                      </td>
                    </tr>
                  ) : (
                    recentRequests.map((req) => (
                      <tr key={req.id} className="group hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 font-semibold text-on-surface text-xs">
                          {req.title}
                        </td>
                        <td className="py-4 text-xs text-secondary">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                            {req.type}
                          </span>
                        </td>
                        <td className="py-4 text-xs">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.priority === "URGENT" || req.priority === "HIGH"
                                ? "bg-red-50 text-red-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {req.priority}
                          </span>
                        </td>
                        <td className="py-4 text-xs font-semibold text-slate-600">
                          {req.status}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => onNavigateTab("requests")}
                            className="px-3.5 py-1.5 bg-slate-100 rounded-full text-[11px] font-bold text-on-surface hover:bg-primary hover:text-white transition-all cursor-pointer"
                          >
                            Детали
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Announcements & Spotlight */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Actions Bento */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onOpenAddUser}
              className="p-5 bg-primary-container text-white rounded-3xl flex flex-col gap-3 hover:scale-[1.02] active:scale-95 transition-all text-left shadow-sm group cursor-pointer"
            >
              <span className="material-symbols-outlined text-white text-2xl">
                person_add
              </span>
              <span className="text-xs font-bold leading-tight">
                Добавить<br />ученика
              </span>
            </button>

            <button
              onClick={onOpenCreateAnnouncement}
              className="p-5 bg-surface-container-highest text-on-surface rounded-3xl flex flex-col gap-3 hover:scale-[1.02] active:scale-95 transition-all text-left shadow-sm group cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-2xl">
                post_add
              </span>
              <span className="text-xs font-bold leading-tight">
                Создать<br />объявление
              </span>
            </button>

            <button
              onClick={() => onNavigateTab("users")}
              className="p-5 bg-surface-container-highest text-on-surface rounded-3xl flex flex-col gap-3 hover:scale-[1.02] active:scale-95 transition-all text-left shadow-sm group cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-2xl">
                upload_file
              </span>
              <span className="text-xs font-bold leading-tight">
                Импорт<br />CSV базы
              </span>
            </button>

            <button
              onClick={() => onNavigateTab("requests")}
              className="p-5 bg-slate-900 text-white rounded-3xl flex flex-col gap-3 hover:scale-[1.02] active:scale-95 transition-all text-left shadow-sm group cursor-pointer"
            >
              <span className="material-symbols-outlined text-red-400 text-2xl">
                assignment
              </span>
              <span className="text-xs font-bold leading-tight">
                Сервисный<br />стол заявок
              </span>
            </button>
          </div>

          {/* Recent Announcements */}
          <div className="bg-surface-container-lowest p-7 rounded-4xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h4 className="text-base font-bold font-headline text-on-surface">
                Объявления гимназии
              </h4>
              <button
                onClick={onOpenCreateAnnouncement}
                className="text-primary text-xs font-bold hover:underline"
              >
                + Создать
              </button>
            </div>

            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="space-y-4">
                  <div className="relative pl-4 border-l-2 border-primary/40 py-1">
                    <span className="px-2 py-0.5 bg-red-50 text-primary text-[9px] font-black uppercase rounded-full">
                      Кампус
                    </span>
                    <p className="text-xs font-bold text-on-surface mt-1">
                      Торжественная линейка и день открытых дверей
                    </p>
                    <p className="text-[11px] text-secondary leading-snug line-clamp-2 mt-0.5">
                      Сбор учащихся и родителей в актовом зале главного корпуса в 10:00.
                    </p>
                  </div>
                  <div className="relative pl-4 border-l-2 border-primary/20 py-1">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black uppercase rounded-full">
                      Учеба
                    </span>
                    <p className="text-xs font-bold text-on-surface mt-1">
                      Публикация промежуточных рейтингов
                    </p>
                    <p className="text-[11px] text-secondary leading-snug line-clamp-2 mt-0.5">
                      Учителя заполнили оценки за первый триместр. Проверьте ведомости.
                    </p>
                  </div>
                </div>
              ) : (
                announcements.slice(0, 3).map((a) => (
                  <div key={a.id} className="relative pl-4 border-l-2 border-primary/30 py-1">
                    <span className="px-2 py-0.5 bg-red-50 text-primary text-[9px] font-black uppercase rounded-full">
                      {a.category || "Общее"}
                    </span>
                    <p className="text-xs font-bold text-on-surface mt-1">
                      {a.title}
                    </p>
                    <p className="text-[11px] text-secondary leading-snug line-clamp-2 mt-0.5">
                      {a.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Student Spotlight (The Academic Curator theme) */}
          <div className="bg-primary p-6 rounded-4xl text-white overflow-hidden relative shadow-md">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-3">
                Гордость Гимназии
              </p>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 bg-white/20 flex items-center justify-center font-bold text-lg font-headline">
                  АМ
                </div>
                <div>
                  <h5 className="text-sm font-bold font-headline">
                    Александр Морозов
                  </h5>
                  <p className="text-[10px] text-white/70">
                    Победитель олимпиады • 11 класс
                  </p>
                </div>
              </div>
              <p className="text-[11px] italic leading-relaxed text-white/90">
                «Гимназия Примакова открывает все возможности для академического роста и раскрытия лидерского потенциала.»
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          </div>
        </div>
      </section>
    </div>
  );
};
