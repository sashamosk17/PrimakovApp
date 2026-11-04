import React, { useState, useMemo } from "react";
import type { BoardingRosterItem, WeekendLeaveRequest } from "../types";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";

interface BoardingViewProps {
  roster: BoardingRosterItem[];
  leaveRequests: WeekendLeaveRequest[];
  onUpdateLeaveStatus: (requestId: string, status: "APPROVED" | "REJECTED") => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const BoardingView: React.FC<BoardingViewProps> = ({
  roster,
  leaveRequests,
  onUpdateLeaveStatus,
  onRefresh,
}) => {
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"roster" | "leaves">("roster");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Stats
  const totalStudents = roster.length;
  const presentCount = roster.filter((r) => r.status === "PRESENT").length;
  const lateCount = roster.filter((r) => r.status === "LATE").length;
  const onLeaveCount = roster.filter((r) => r.hasActiveLeave).length;

  const handleStatusChange = async (requestId: string, status: "APPROVED" | "REJECTED") => {
    try {
      setIsUpdating(requestId);
      await onUpdateLeaveStatus(requestId, status);
      showToast(
        status === "APPROVED" ? "Заявление на выезд одобрено" : "Заявление на выезд отклонено",
        status === "APPROVED" ? "success" : "info"
      );
    } catch (err: any) {
      showToast(err.message || "Ошибка обновления статуса", "error");
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredRoster = useMemo(() => {
    if (!searchQuery) return roster;
    const q = searchQuery.toLowerCase();
    return roster.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.groupName.toLowerCase().includes(q) ||
        (r.roomNumber && r.roomNumber.toLowerCase().includes(q))
    );
  }, [roster, searchQuery]);

  const filteredLeaves = useMemo(() => {
    if (!searchQuery) return leaveRequests;
    const q = searchQuery.toLowerCase();
    return leaveRequests.filter(
      (l) =>
        (l.studentName && l.studentName.toLowerCase().includes(q)) ||
        l.transportType.toLowerCase().includes(q) ||
        l.status.toLowerCase().includes(q)
    );
  }, [leaveRequests, searchQuery]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-on-surface font-display tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">hotel</span>
            {t("boarding.title")}
          </h3>
          <p className="text-xs text-secondary mt-1">
            {t("boarding.subtitle")}
          </p>
        </div>

        <button
          onClick={() => onRefresh()}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          {t("boarding.refresh")}
        </button>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-slate-100 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {t("boarding.totalInBoarding")}
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalStudents}</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-slate-100 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            {t("boarding.inCampus")}
          </p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{presentCount}</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-slate-100 shadow-xs">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {t("boarding.late")}
          </p>
          <p className="text-2xl font-black text-amber-600 mt-1">{lateCount}</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-slate-100 shadow-xs">
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">flight_takeoff</span>
            {t("boarding.onLeave")}
          </p>
          <p className="text-2xl font-black text-blue-600 mt-1">{onLeaveCount}</p>
        </div>
      </div>

      {/* Subtabs: Roster vs Leave Passes */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("roster")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === "roster"
              ? "text-primary border-b-2 border-primary"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-lg">badge</span>
          {t("boarding.tabRoster")} ({roster.length})
        </button>

        <button
          onClick={() => setActiveTab("leaves")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === "leaves"
              ? "text-primary border-b-2 border-primary"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-lg">assignment</span>
          {t("boarding.tabLeaves")} ({leaveRequests.length})
          {leaveRequests.some((l) => l.status === "PENDING") && (
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          )}
        </button>
      </div>

      {/* Search Input */}
      <div className="flex justify-between items-center bg-surface-container-lowest p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("boarding.searchPlaceholder")}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-sm">
            search
          </span>
        </div>
      </div>

      {/* Tab 1: Roster Table */}
      {activeTab === "roster" && (
        <div className="bg-surface-container-lowest rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">{t("boarding.colStudent")}</th>
                  <th className="py-3 px-4">{t("boarding.colClass")}</th>
                  <th className="py-3 px-4">{t("boarding.colRoom")}</th>
                  <th className="py-3 px-4">{t("boarding.colStatus")}</th>
                  <th className="py-3 px-4">{t("boarding.colTime")}</th>
                  <th className="py-3 px-4">{t("boarding.colWeekendPass")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoster.map((r) => {
                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {t("boarding.statusAbsent")}
                    </span>
                  );
                  if (r.status === "PRESENT") {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {t("boarding.statusPresent")}
                      </span>
                    );
                  } else if (r.status === "LATE") {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                        {t("boarding.statusLate")}
                      </span>
                    );
                  }

                  return (
                    <tr key={r.studentId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {r.studentName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {r.groupName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {r.roomNumber || "—"}
                      </td>
                      <td className="py-3 px-4">
                        {statusBadge}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {r.lastCheckInTime
                          ? new Date(r.lastCheckInTime).toLocaleTimeString(language === "en" ? "en-US" : "ru-RU", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : (language === "en" ? "No record" : "Нет данных")}
                      </td>
                      <td className="py-3 px-4">
                        {r.hasActiveLeave ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600">
                            <span className="material-symbols-outlined text-xs">flight</span>
                            {t("boarding.passApproved")}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Weekend Leave Passes Table */}
      {activeTab === "leaves" && (
        <div className="bg-surface-container-lowest rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          {filteredLeaves.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              {language === "en" ? "No weekend leave requests found" : "Заявления на выезд отсутствуют"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">{t("boarding.colStudent")}</th>
                    <th className="py-3 px-4">{language === "en" ? "Departure / Return Dates" : "Даты выезда / возвращения"}</th>
                    <th className="py-3 px-4">{t("boarding.transport")}</th>
                    <th className="py-3 px-4">{language === "en" ? "Guardian Consent" : "Согласие родителей"}</th>
                    <th className="py-3 px-4">{t("boarding.colStatus")}</th>
                    <th className="py-3 px-4 text-right">{t("users.colActions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeaves.map((l) => {
                    const isPending = l.status === "PENDING";
                    const isApproved = l.status === "APPROVED";
                    const isRejected = l.status === "REJECTED";

                    return (
                      <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {l.studentName || l.studentId}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="font-medium">
                            {t("boarding.departure")}: {new Date(l.departureDate).toLocaleDateString(language === "en" ? "en-US" : "ru-RU")}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {t("boarding.return")}: {new Date(l.returnDate).toLocaleDateString(language === "en" ? "en-US" : "ru-RU")}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-medium">
                            {l.transportType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {l.guardianConfirmed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <span className="material-symbols-outlined text-xs">verified</span>
                              {language === "en" ? "Confirmed" : "Подтверждено"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                              <span className="material-symbols-outlined text-xs">warning</span>
                              {language === "en" ? "Awaiting Call" : "Ожидает звонка"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {isPending && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700">
                              {t("boarding.passPending")}
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700">
                              {t("boarding.passApproved")}
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700">
                              {language === "en" ? "Rejected" : "Отклонено"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                disabled={isUpdating === l.id}
                                onClick={() => handleStatusChange(l.id, "APPROVED")}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] cursor-pointer transition-colors shadow-xs"
                              >
                                {t("boarding.approve")}
                              </button>
                              <button
                                disabled={isUpdating === l.id}
                                onClick={() => handleStatusChange(l.id, "REJECTED")}
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-[11px] cursor-pointer transition-colors"
                              >
                                {t("boarding.reject")}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {language === "en" ? "Decision recorded" : "Решение принято"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

