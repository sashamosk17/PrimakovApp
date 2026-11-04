import React, { useState } from "react";
import type { DashboardMetrics, ActivityPoint, ServiceRequest, Announcement } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface DashboardViewProps {
  metrics: DashboardMetrics;
  weeklyActivity: ActivityPoint[];
  recentRequests: ServiceRequest[];
  announcements: Announcement[];
  onOpenAddUser?: () => void;
  onOpenCreateAnnouncement?: () => void;
  onNavigateTab: (tab: string) => void;
}

const Sparkline: React.FC<{ points: number[]; color: string }> = ({ points, color }) => {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const step = width / (points.length - 1);
  const pathD = points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / range) * (height - 8) - 4;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible opacity-90">
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.4"
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
  onOpenCreateAnnouncement,
  onNavigateTab,
}) => {
  const { t } = useLanguage();
  const [activityRole, setActivityRole] = useState<"STUDENTS" | "TEACHERS">("STUDENTS");

  const displayedActivity = weeklyActivity.map((p) => ({
    day: p.day,
    count: activityRole === "TEACHERS" ? Math.max(12, Math.round(p.count * 0.26)) : p.count,
  }));

  // Sparkline data trends
  const dauTrend = [980, 1020, 1060, 1090, 1110, 1105, metrics.dauCount || 1120];
  const attendanceTrend = [94.5, 95.0, 95.5, 95.8, 96.0, 96.2, metrics.attendanceRate || 96.4];
  const slaTrend = [91.0, 92.5, 93.0, 93.8, 94.2, 94.5, metrics.slaComplianceRate || 94.8];
  const csiTrend = [4.65, 4.70, 4.75, 4.80, 4.82, 4.85, metrics.csiIndex || 4.88];

  const urgentRequests = recentRequests.filter(
    (r) => (r.priority === "URGENT" || r.priority === "HIGH") && r.status !== "COMPLETED"
  );

  return (
    <div className="space-y-8 academic-sketch-bg pb-12">
      {/* 1. Operational Hero & System Pulse Header */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/60 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 backdrop-blur-md shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t("dash.systemAllOk")}
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {metrics.apiLatencyMs || 24}ms latency
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              МЭШ: {metrics.meshLastSyncTime || "Сегодня, 08:30"}
            </span>
          </div>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-on-surface dark:text-white font-headline tracking-tight">
            {t("dash.title")}
          </h3>
          <p className="text-secondary dark:text-slate-400 text-xs font-medium mt-1">
            {t("dash.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xs border border-slate-200/70 dark:border-slate-700/60">
            <div className="w-8 h-8 rounded-xl bg-red-900/10 dark:bg-red-500/10 text-red-900 dark:text-red-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">calendar_month</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {t("dash.period")}
              </p>
              <p className="text-xs font-bold text-on-surface dark:text-slate-200">
                {t("dash.semester")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Four Core Product Health KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: DAU & User Engagement */}
        <div className="bg-surface-container-lowest dark:bg-slate-800/80 p-6 rounded-3xl flex flex-col justify-between h-44 shadow-xs border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-primary dark:text-red-400">
              <span className="material-symbols-outlined text-xl">insights</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
              {metrics.dauPercentage || 84.5}% активных
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-black text-on-surface dark:text-white font-headline tracking-tight">
                {metrics.dauCount || 1120}
              </h4>
              <p className="text-xs text-secondary dark:text-slate-400 font-semibold mt-0.5">
                {t("dash.dau")}
              </p>
            </div>
            <Sparkline points={dauTrend} color="#2e7d32" />
          </div>
        </div>

        {/* KPI 2: Class Attendance */}
        <div className="bg-surface-container-lowest dark:bg-slate-800/80 p-6 rounded-3xl flex flex-col justify-between h-44 shadow-xs border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-700 dark:text-teal-400">
              <span className="material-symbols-outlined text-xl">verified_user</span>
            </div>
            <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-0.5 rounded-full border border-teal-200/50 dark:border-teal-800/50">
              Норма ≥95%
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-black text-on-surface dark:text-white font-headline tracking-tight">
                {metrics.attendanceRate || 96.4}%
              </h4>
              <p className="text-xs text-secondary dark:text-slate-400 font-semibold mt-0.5">
                {t("dash.attendance")}
              </p>
            </div>
            <Sparkline points={attendanceTrend} color="#00897b" />
          </div>
        </div>

        {/* KPI 3: SLA Ticket Compliance */}
        <div className="bg-surface-container-lowest dark:bg-slate-800/80 p-6 rounded-3xl flex flex-col justify-between h-44 shadow-xs border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <span className="material-symbols-outlined text-xl">task_alt</span>
            </div>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-800/50">
              {metrics.activeRequests || 14} в работе
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-black text-on-surface dark:text-white font-headline tracking-tight">
                {metrics.slaComplianceRate || 94.8}%
              </h4>
              <p className="text-xs text-secondary dark:text-slate-400 font-semibold mt-0.5">
                {t("dash.sla")}
              </p>
            </div>
            <Sparkline points={slaTrend} color="#d97706" />
          </div>
        </div>

        {/* KPI 4: CSI Satisfaction Index */}
        <div className="bg-surface-container-lowest dark:bg-slate-800/80 p-6 rounded-3xl flex flex-col justify-between h-44 shadow-xs border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-700 dark:text-indigo-400">
              <span className="material-symbols-outlined text-xl">star</span>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
              Шкала 5.0
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h4 className="text-3xl font-black text-on-surface dark:text-white font-headline tracking-tight">
                {metrics.csiIndex || 4.88}
              </h4>
              <p className="text-xs text-secondary dark:text-slate-400 font-semibold mt-0.5">
                {t("dash.csi")}
              </p>
            </div>
            <Sparkline points={csiTrend} color="#4f46e5" />
          </div>
        </div>
      </section>

      {/* 3. Main Data Layer (Traffic Pulse & Incidents vs Operational Vitals) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Traffic Pulse & Recent Requests */}
        <div className="lg:col-span-8 space-y-8">
          {/* Traffic & Load Pulse Chart */}
          <div className="bg-surface-container-low dark:bg-slate-800/60 p-7 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
              <div>
                <h4 className="text-base font-bold font-headline text-on-surface dark:text-white">
                  {t("dash.trafficPulse")}
                </h4>
                <p className="text-xs text-secondary dark:text-slate-400">
                  {t("dash.trafficSubtitle")}
                </p>
              </div>
              <div className="flex gap-1.5 bg-slate-200/60 dark:bg-slate-700/60 p-1 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setActivityRole("STUDENTS")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activityRole === "STUDENTS"
                      ? "bg-white dark:bg-slate-800 text-red-900 dark:text-red-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-300"
                  }`}
                >
                  {t("dash.students")}
                </button>
                <button
                  onClick={() => setActivityRole("TEACHERS")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activityRole === "TEACHERS"
                      ? "bg-white dark:bg-slate-800 text-red-900 dark:text-red-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-300"
                  }`}
                >
                  {t("dash.teachers")}
                </button>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-52 w-full flex items-end justify-between gap-3 px-2 pt-4">
              {displayedActivity.map((point, index) => {
                const maxVal = Math.max(...displayedActivity.map((p) => p.count), 100);
                const heightPct = Math.round((point.count / maxVal) * 100);
                const isPeak = point.count === Math.max(...displayedActivity.map((p) => p.count));
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-red-950 dark:text-white transition-opacity bg-white dark:bg-slate-700 px-2 py-0.5 rounded shadow-xs">
                      {point.count}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        isPeak
                          ? "bg-gradient-to-t from-red-900 to-red-600 shadow-sm shadow-red-900/30"
                          : "bg-red-800/35 dark:bg-red-500/20 group-hover:bg-red-700/60"
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

          {/* Service Desk Recent Requests */}
          <div className="bg-surface-container-lowest dark:bg-slate-800/80 p-7 rounded-3xl shadow-xs border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h4 className="text-base font-bold font-headline text-on-surface dark:text-white">
                  {t("dash.recentRequests")}
                </h4>
                <p className="text-xs text-secondary dark:text-slate-400">
                  IT, техническое обслуживание и кампус
                </p>
              </div>
              <button
                onClick={() => onNavigateTab("requests")}
                className="text-red-900 dark:text-red-400 text-xs font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                {t("dash.allRequests")}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-700/60">
                  <tr>
                    <th className="pb-3">Заявка</th>
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
                    recentRequests.slice(0, 5).map((req) => (
                      <tr key={req.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 font-semibold text-on-surface dark:text-slate-200 text-xs">
                          {req.title}
                        </td>
                        <td className="py-3.5 text-xs text-secondary">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                            {req.type}
                          </span>
                        </td>
                        <td className="py-3.5 text-xs">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.priority === "URGENT" || req.priority === "HIGH"
                                ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/50"
                                : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50"
                            }`}
                          >
                            {req.priority}
                          </span>
                        </td>
                        <td className="py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {req.status}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => onNavigateTab("requests")}
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[11px] font-bold text-on-surface dark:text-slate-200 hover:bg-red-900 hover:text-white transition-all cursor-pointer"
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

        {/* Right Column (4 cols): Actionable Alerts & Ecosystem Module Vitals & Infrastructure */}
        <div className="lg:col-span-4 space-y-6">
          {/* Actionable Alerts Widget */}
          <div className="bg-surface-container-lowest dark:bg-slate-800/80 p-6 rounded-3xl shadow-xs border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h4 className="text-sm font-bold font-headline text-on-surface dark:text-white">
                  {t("dash.alertsTitle")}
                </h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Внимание
              </span>
            </div>

            <div className="space-y-3">
              {urgentRequests.length > 0 ? (
                <div className="p-3.5 rounded-2xl bg-red-50/80 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 flex flex-col gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-lg shrink-0 mt-0.5">
                      warning
                    </span>
                    <div>
                      <p className="text-xs font-bold text-red-950 dark:text-red-200">
                        {urgentRequests.length} срочные заявки ожидают решения
                      </p>
                      <p className="text-[11px] text-red-800/80 dark:text-red-300 leading-snug mt-0.5">
                        {urgentRequests[0].title}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab("requests")}
                    className="self-end px-3 py-1 bg-red-800 hover:bg-red-700 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Решить в Service Desk →
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                  <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                  <p className="text-xs font-semibold">Срочных технических инцидентов нет</p>
                </div>
              )}

              {/* Schedule Alert Item */}
              <div className="p-3.5 rounded-2xl bg-surface-container-low dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-slate-500 text-lg">sync_alt</span>
                  <div>
                    <p className="text-xs font-bold text-on-surface dark:text-white">
                      Замены в расписании
                    </p>
                    <p className="text-[11px] text-secondary dark:text-slate-400">
                      2 подтвержденные замены на сегодня
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab("schedule")}
                  className="text-xs font-bold text-red-900 dark:text-red-400 hover:underline cursor-pointer"
                >
                  Обзор →
                </button>
              </div>

              {/* Boarding Alert Item */}
              <div className="p-3.5 rounded-2xl bg-surface-container-low dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-slate-500 text-lg">hotel</span>
                  <div>
                    <p className="text-xs font-bold text-on-surface dark:text-white">
                      Пансион (Boarding)
                    </p>
                    <p className="text-[11px] text-secondary dark:text-slate-400">
                      142/142 в кампусе • Нарушений нет
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab("boarding")}
                  className="text-xs font-bold text-red-900 dark:text-red-400 hover:underline cursor-pointer"
                >
                  Статус →
                </button>
              </div>
            </div>
          </div>

          {/* Module Vitals */}
          <div className="bg-surface-container-lowest dark:bg-slate-800/80 p-6 rounded-3xl shadow-xs border border-slate-200/60 dark:border-slate-700/60 space-y-4">
            <h4 className="text-sm font-bold font-headline text-on-surface dark:text-white">
              {t("dash.moduleVitals")}
            </h4>

            <div className="space-y-3">
              {/* Canteen */}
              <div
                onClick={() => onNavigateTab("canteen")}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer border border-transparent hover:border-slate-200/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">restaurant</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface dark:text-white">Столовая и питание</p>
                    <p className="text-[11px] text-secondary dark:text-slate-400">
                      {metrics.canteenOrdersToday || 840} предзаказов питания • Меню активно
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-base">chevron_right</span>
              </div>

              {/* Houses */}
              <div
                onClick={() => onNavigateTab("houses")}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer border border-transparent hover:border-slate-200/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">shield</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface dark:text-white">Кубок Домов</p>
                    <p className="text-[11px] text-secondary dark:text-slate-400">
                      Лидер: Дом Восток • 4 Дома в игре
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-base">chevron_right</span>
              </div>

              {/* Stories & Announcements */}
              <div
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors border border-transparent hover:border-slate-200/60"
              >
                <div
                  onClick={() => onNavigateTab("stories")}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">auto_stories</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface dark:text-white">Истории и публикации</p>
                    <p className="text-[11px] text-secondary dark:text-slate-400">
                      4 активных сторис • {announcements.length} объявлений
                    </p>
                  </div>
                </div>
                {onOpenCreateAnnouncement && (
                  <button
                    onClick={onOpenCreateAnnouncement}
                    title="Создать объявление"
                    className="p-1.5 text-slate-400 hover:text-red-900 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Infrastructure & Stack Info */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Инфраструктура Primakov OS
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Uptime: 99.98%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400 font-mono">
              <div className="bg-slate-800/80 p-2.5 rounded-xl">
                <p className="text-[9px] uppercase text-slate-500 font-sans font-bold">API Backend</p>
                <p className="font-semibold text-slate-200 mt-0.5">Node 20 • Express</p>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl">
                <p className="text-[9px] uppercase text-slate-500 font-sans font-bold">База данных</p>
                <p className="font-semibold text-slate-200 mt-0.5">PostgreSQL 14 (Pool OK)</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
