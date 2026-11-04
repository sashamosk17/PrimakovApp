import React, { useState } from "react";
import type { AuditLogEntry } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface AuditLogViewProps {
  logs: AuditLogEntry[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  logs,
  onRefresh,
  isLoading = false,
}) => {
  const { t } = useLanguage();
  const [selectedEntity, setSelectedEntity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filterCategories = [
    { id: "ALL", label: t("audit.filterAll") },
    { id: "USER", label: t("audit.filterUsers") },
    { id: "SCHEDULE", label: t("audit.filterSchedule") },
    { id: "REQUEST", label: t("audit.filterRequests") },
    { id: "BOARDING", label: t("audit.filterBoarding") },
    { id: "GRADE", label: t("audit.filterGrades") },
    { id: "CANTEEN", label: t("audit.filterCanteen") },
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesEntity = selectedEntity === "ALL" || log.entity === selectedEntity;
    const matchesSearch =
      !searchQuery ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.userName && log.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.entityId && log.entityId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.ipAddress && log.ipAddress.includes(searchQuery));
    return matchesEntity && matchesSearch;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.startsWith("FAILED_")) {
      return "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300";
    }
    if (action.startsWith("CREATE_")) {
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300";
    }
    if (action.startsWith("UPDATE_") || action.startsWith("ASSIGN_")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300";
    }
    if (action.startsWith("DELETE_")) {
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300";
    }
    if (action.startsWith("APPROVE_")) {
      return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300";
    }
    return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border-slate-300";
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <section className="bg-white/60 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 backdrop-blur-md shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300 text-[11px] font-bold">
              <span className="material-symbols-outlined text-xs">verified_user</span>
              Безопасность и соответствие
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {logs.length} событий зафиксировано
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-on-surface dark:text-white font-headline tracking-tight">
            {t("audit.title")}
          </h3>
          <p className="text-secondary dark:text-slate-400 text-xs font-medium mt-1">
            {t("audit.subtitle")}
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-xs border border-slate-200/60 dark:border-slate-700"
          >
            <span className={`material-symbols-outlined text-base ${isLoading ? "animate-spin" : ""}`}>
              refresh
            </span>
            {t("audit.refresh")}
          </button>
        )}
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filterCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedEntity(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedEntity === cat.id
                  ? "bg-red-900 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по действию, email, IP..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 rounded-2xl text-xs border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-red-900 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl shadow-xs border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50/80 dark:bg-slate-800/80 tracking-wider border-b border-slate-200/60 dark:border-slate-700/60">
              <tr>
                <th className="py-3 px-4">{t("audit.colTime")}</th>
                <th className="py-3 px-4">{t("audit.colUser")}</th>
                <th className="py-3 px-4">{t("audit.colAction")}</th>
                <th className="py-3 px-4">{t("audit.colEntity")}</th>
                <th className="py-3 px-4">{t("audit.colDetails")}</th>
                <th className="py-3 px-4">{t("audit.colIp")}</th>
                <th className="py-3 px-4 text-right">Инфо</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    <span className="material-symbols-outlined text-3xl mb-2 text-slate-300 block">
                      history
                    </span>
                    {t("audit.empty")}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((entry) => {
                  const isExpanded = expandedLogId === entry.id;
                  return (
                    <React.Fragment key={entry.id}>
                      <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {formatTimestamp(entry.createdAt)}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {entry.userName || "Системный сервис"}
                          </p>
                          <p className="text-[10px] text-slate-400">{entry.userEmail || "system"}</p>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getActionBadgeColor(
                              entry.action
                            )}`}
                          >
                            {entry.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {entry.entity}
                          </span>
                          {entry.entityId && (
                            <span className="block text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                              {entry.entityId}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300 text-[11px]">
                          {entry.details ? JSON.stringify(entry.details).slice(0, 70) : "—"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {entry.ipAddress || "local"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : entry.id)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-200 transition-colors cursor-pointer"
                          >
                            {isExpanded ? "Скрыть" : "Детали"}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/90 dark:bg-slate-900/50">
                          <td colSpan={7} className="p-4 border-t border-slate-200/60 dark:border-slate-700">
                            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner">
                              <p className="text-[10px] uppercase text-emerald-400 font-bold mb-2">
                                Полный контекст полезной нагрузки (Audit Payload Diff)
                              </p>
                              <pre className="text-[11px] leading-relaxed">
                                {JSON.stringify(
                                  {
                                    id: entry.id,
                                    action: entry.action,
                                    entity: entry.entity,
                                    entityId: entry.entityId,
                                    user: { id: entry.userId, email: entry.userEmail, name: entry.userName },
                                    ipAddress: entry.ipAddress,
                                    createdAt: entry.createdAt,
                                    details: entry.details,
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

