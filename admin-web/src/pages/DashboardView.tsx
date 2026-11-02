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

const Sparkline: React.FC<{ points: number[]; color: string }> = ({ points, color }) => {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 76;
  const height = 26;
  const step = width / (points.length - 1);
  const pathD = points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / range) * (height - 6) - 3;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible opacity-85">
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

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

  const studentTrend = [790, 810, 820, 835, 842, 845, metrics.totalStudents || 847];
  const requestsTrend = [12, 19, 15, 22, 18, 14, metrics.activeRequests || 8];
  const csiTrend = [4.6, 4.7, 4.65, 4.75, 4.8, 4.82, metrics.csiIndex || 4.8];
  const attendanceTrend = [92.0, 93.5, 94.0, 93.8, 94.5, 94.0, metrics.attendanceRate || 94.2];

  return (
    <div className="space-y-8 academic-sketch-bg pb-12">
      {/* Hero Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/10 dark:bg-red-500/10 text-red-900 dark:text-red-400 text-xs font-bold font-headline mb-2">
            <span className="w-2 h-2 rounded-full bg-red-700 animate-pulse" />
            Институциональный Дашборд 2.0
          </div>
          <h3 className="text-3xl lg:text-4xl font-extrabold text-on-surface font-headline tracking-tight">
            Академический Центр Управления
          </h3>
          <p className="text-secondary font-medium mt-1 text-sm">
            Гимназия им. Е.М. Примакова • Премиальная образовательная экосистема
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-lowest dark:bg-slate-800/80 p-3.5 rounded-2xl flex items-center gap-3 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
            <div className="bg-primary/10 text-primary dark:text-red-400 p-2 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">event</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Учебный период
              </p>
              <p className="text-xs font-bold text-on-surface dark:text-slate-200">
                Осенний семестр 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid with Sparklines */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Students */}
        <div className="bg-surface-container-lowest dark:bg-slate-800/80 p-6 rounded-3xl flex flex-col justify-between h-44 shadow-sm border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-primary dark:text-red-400">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
              +4.2%
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-black text-on-surface dark:text-white font-headline tracking-tight">
                {metrics.totalStudents || 847}
              </h4>
              <p className="text-xs text-secondary dark:text-slate-400 font-semibold mt-0.5">
                Всего учащихся
              </p>
            </div>
            <Sparkline points={studentTrend} color="#2e7d32" />
          </div>
        </div>

        {/* Active Requests */}
        <div className="bg-surface-container-lowest dark:bg-slate-800/80 p-6 rounded-3xl flex flex-col justify-between h-44 shadow-sm border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <span className="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200/50 dark:border-red-800/50">
              В работе
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-black text-on-surface dark:text-white font-headline tracking-tight">
                {metrics.activeRequests}
              </h4>
              <p className="text-xs text-secondary dark:text-slate-400 font-semibold mt-0.5">
                Сервисные заявки
              </p>
            </div>
            <Sparkline points={requestsTrend} color="#e65100" />
          </div>
        </div>

        {/* CSI Index */}
        <div className="bg-surface-container-lowest dark:bg-slate-800/80 p-6 rounded-3xl flex flex-col justify-between h-44 shadow-sm border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-700 dark:text-indigo-400">
              <span className="material-symbols-outlined text-2xl">star</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
              Цель: 5.0
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-black text-on-surface dark:text-white font-headline tracking-tight">
                {metrics.csiIndex || 4.8}
              </h4>
              <p className="text-xs text-secondary dark:text-slate-400 font-semibold mt-0.5">
                Индекс CSI (Рейтинг)
              </p>
            </div>
            <Sparkline points={csiTrend} color="#3f51b5" />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-surface-container-lowest dark:bg-slate-800/80 p-6 rounded-3xl flex flex-col justify-between h-44 shadow-sm border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-700 dark:text-teal-400">
              <span className="material-symbols-outlined text-2xl">calendar_month</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
              В норме
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-black text-on-surface dark:text-white font-headline tracking-tight">
                {metrics.attendanceRate || 94.2}%
              </h4>
              <p className="text-xs text-secondary dark:text-slate-400 font-semibold mt-0.5">
                Посещаемость
              </p>
            </div>
            <Sparkline points={attendanceTrend} color="#00897b" />
          </div>
        </div>
      </section>

      {/* Main Data Layer */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Weekly Trends & Recent Requests */}
        <div className="lg:col-span-8 space-y-8">
          {/* Weekly Trends Chart */}
          <div className="bg-surface-container-low dark:bg-slate-800/60 p-8 rounded-4xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-lg font-bold font-headline text-on-surface dark:text-white">
                  Недельная активность экосистемы
                </h4>
                <p className="text-xs text-secondary dark:text-slate-400">
                  Количество обращений и заходов в приложение
                </p>
              </div>
              <div className="flex gap-2 bg-slate-200/50 dark:bg-slate-700/50 p-1 rounded-xl">
                <button
                  onClick={() => setActivityRole("STUDENTS")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activityRole === "STUDENTS"
                      ? "bg-white dark:bg-slate-800 text-on-surface dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
                >
                  {t("dash.students")}
                </button>
                <button
                  onClick={() => setActivityRole("TEACHERS")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activityRole === "TEACHERS"
                      ? "bg-white dark:bg-slate-800 text-on-surface dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
                >
                  {t("dash.teachers")}
                </button>
              </div>
            </div>

            {/* Interactive Visual Bar Chart with Rounded Pills */}
            <div className="h-56 w-full flex items-end justify-between gap-4 px-2">
              {displayedActivity.map((point, index) => {
                const maxVal = Math.max(...displayedActivity.map((p) => p.count), 100);
                const heightPct = Math.round((point.count / maxVal) * 100);
                const isPeak = point.count === Math.max(...displayedActivity.map((p) => p.count));
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-red-950 dark:text-white transition-opacity bg-white dark:bg-slate-700 px-2 py-0.5 rounded shadow">
                      {point.count}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-2xl transition-all duration-300 ${
                        isPeak
                          ? "bg-gradient-to-t from-red-900 to-red-600 shadow-lg shadow-red-900/30"
                          : "bg-red-800/30 dark:bg-red-500/20 group-hover:bg-red-700/50"
                      }`}
                    />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {point.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Student Requests Table */}
          <div className="bg-surface-container-lowest dark:bg-slate-800/80 p-8 rounded-4xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-lg font-bold font-headline text-on-surface dark:text-white">
                  Недавние сервисные заявки
                </h4>
                <p className="text-xs text-secondary dark:text-slate-400">
                  IT, техническое обслуживание и кампус
                </p>
              </div>
              <button
                onClick={() => onNavigateTab("requests")}
                className="text-primary dark:text-red-400 text-xs font-bold hover:underline cursor-pointer"
              >
                Все заявки →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-700/60">
                  <tr>
                    <th className="pb-3">Заявка / Тема</th>
                    <th className="pb-3">Категория</th>
                    <th className="pb-3">Приоритет</th>
                    <th className="pb-3">Статус</th>
                    <th className="pb-3 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700/40">
                  {recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                        Нет активных заявок
                      </td>
                    </tr>
                  ) : (
                    recentRequests.map((req) => (
                      <tr key={req.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-4 font-semibold text-on-surface dark:text-slate-200 text-xs">
                          {req.title}
                        </td>
                        <td className="py-4 text-xs text-secondary">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                            {req.type}
                          </span>
                        </td>
                        <td className="py-4 text-xs">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              req.priority === "URGENT" || req.priority === "HIGH"
                                ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/50"
                                : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50"
                            }`}
                          >
                            {req.priority}
                          </span>
                        </td>
                        <td className="py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {req.status}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => onNavigateTab("requests")}
                            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-[11px] font-bold text-on-surface dark:text-slate-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
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
              className="p-5 bg-gradient-to-br from-red-900 to-red-700 text-white rounded-3xl flex flex-col gap-3 hover:scale-[1.02] active:scale-95 transition-all text-left shadow-sm group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">person_add</span>
              </div>
              <span className="text-xs font-bold leading-tight font-headline">
                Добавить<br />ученика
              </span>
            </button>

            <button
              onClick={onOpenCreateAnnouncement}
              className="p-5 bg-surface-container-highest dark:bg-slate-800 text-on-surface dark:text-white rounded-3xl flex flex-col gap-3 hover:scale-[1.02] active:scale-95 transition-all text-left shadow-sm border border-slate-200/60 dark:border-slate-700/60 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-red-400/10 flex items-center justify-center text-primary dark:text-red-400">
                <span className="material-symbols-outlined text-xl">post_add</span>
              </div>
              <span className="text-xs font-bold leading-tight font-headline">
                Создать<br />объявление
              </span>
            </button>

            <button
              onClick={() => onNavigateTab("users")}
              className="p-5 bg-surface-container-highest dark:bg-slate-800 text-on-surface dark:text-white rounded-3xl flex flex-col gap-3 hover:scale-[1.02] active:scale-95 transition-all text-left shadow-sm border border-slate-200/60 dark:border-slate-700/60 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-red-400/10 flex items-center justify-center text-primary dark:text-red-400">
                <span className="material-symbols-outlined text-xl">upload_file</span>
              </div>
              <span className="text-xs font-bold leading-tight font-headline">
                Импорт<br />CSV базы
              </span>
            </button>

            <button
              onClick={() => onNavigateTab("requests")}
              className="p-5 bg-slate-900 dark:bg-slate-800 text-white rounded-3xl flex flex-col gap-3 hover:scale-[1.02] active:scale-95 transition-all text-left shadow-sm group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                <span className="material-symbols-outlined text-xl">assignment</span>
              </div>
              <span className="text-xs font-bold leading-tight font-headline">
                Сервисный<br />стол заявок
              </span>
            </button>
          </div>

          {/* Recent Announcements */}
          <div className="bg-surface-container-lowest dark:bg-slate-800/80 p-7 rounded-4xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex justify-between items-center mb-5">
              <h4 className="text-base font-bold font-headline text-on-surface dark:text-white">
                Объявления гимназии
              </h4>
              <button
                onClick={onOpenCreateAnnouncement}
                className="text-primary dark:text-red-400 text-xs font-bold hover:underline cursor-pointer"
              >
                + Создать
              </button>
            </div>

            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="space-y-4">
                  <div className="relative pl-4 border-l-2 border-primary/40 py-1">
                    <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 text-primary dark:text-red-400 text-[9px] font-black uppercase rounded-full">
                      Кампус
                    </span>
                    <p className="text-xs font-bold text-on-surface dark:text-white mt-1">
                      Торжественная линейка и день открытых дверей
                    </p>
                    <p className="text-[11px] text-secondary dark:text-slate-400 leading-snug line-clamp-2 mt-0.5">
                      Сбор учащихся и родителей в актовом зале главного корпуса в 10:00.
                    </p>
                  </div>
                  <div className="relative pl-4 border-l-2 border-primary/20 py-1">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase rounded-full">
                      Учеба
                    </span>
                    <p className="text-xs font-bold text-on-surface dark:text-white mt-1">
                      Публикация промежуточных рейтингов
                    </p>
                    <p className="text-[11px] text-secondary dark:text-slate-400 leading-snug line-clamp-2 mt-0.5">
                      Учителя заполнили оценки за первый триместр. Проверьте ведомости.
                    </p>
                  </div>
                </div>
              ) : (
                announcements.slice(0, 3).map((a) => (
                  <div key={a.id} className="relative pl-4 border-l-2 border-primary/30 py-1">
                    <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 text-primary dark:text-red-400 text-[9px] font-black uppercase rounded-full">
                      {a.category || "Общее"}
                    </span>
                    <p className="text-xs font-bold text-on-surface dark:text-white mt-1">
                      {a.title}
                    </p>
                    <p className="text-[11px] text-secondary dark:text-slate-400 leading-snug line-clamp-2 mt-0.5">
                      {a.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Student Spotlight (The Academic Curator theme) */}
          <div className="bg-gradient-to-br from-red-900 to-red-800 p-6 rounded-4xl text-white overflow-hidden relative shadow-md">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-3 font-headline">
                Гордость Гимназии
              </p>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/20 bg-white/20 flex items-center justify-center font-bold text-lg font-headline">
                  АМ
                </div>
                <div>
                  <h5 className="text-sm font-bold font-headline">
                    Александр Морозов
                  </h5>
                  <p className="text-[10px] text-white/75">
                    Победитель олимпиады • 11 класс
                  </p>
                </div>
              </div>
              <p className="text-[11px] italic leading-relaxed text-white/90">
                «Гимназия Примакова открывает все возможности для академического роста и раскрытия лидерского потенциала.»
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
};
