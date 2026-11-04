import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import type { ServiceRequest } from "../types";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  adminName?: string;
  adminEmail?: string;
  urgentRequests?: ServiceRequest[];
  onSelectRequest?: (req: ServiceRequest) => void;
  onNavigateTab?: (tab: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  adminName = "Администратор",
  adminEmail = "admin@primakov.school",
  urgentRequests = [],
  onNavigateTab,
  onToggleMobileMenu,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setIsAlertsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const urgentCount = urgentRequests.filter((r) => r.status !== "COMPLETED").length;

  return (
    <header className="flex justify-between items-center w-full px-4 sm:px-8 py-3.5 sticky top-0 bg-white/95 backdrop-blur-lg z-40 border-b border-slate-100 shadow-xs">
      {/* Search Input with Mobile Hamburger */}
      <div className="flex items-center gap-2.5 flex-1 max-w-md">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Меню навигации"
            aria-label="Открыть меню"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        )}
        <div className="flex bg-slate-100/80 dark:bg-slate-800/70 rounded-full px-4 py-2 items-center gap-2.5 w-full border border-slate-200/60 dark:border-slate-700/60 focus-within:border-red-900/40 dark:focus-within:border-red-500/40 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all shadow-xs">
          <span className="material-symbols-outlined text-slate-400 text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("header.searchPlaceholder")}
            className="bg-transparent border-none text-xs text-slate-800 dark:text-slate-200 focus:ring-0 focus:outline-none w-full placeholder:text-slate-400 font-body"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange("")}
              className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          ) : (
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/70 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">
              ⌘K
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Switcher RU / EN */}
        <div className="flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200">
          <button
            onClick={() => setLanguage("ru")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
              language === "ru"
                ? "bg-white text-red-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            RU
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
              language === "en"
                ? "bg-white text-red-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            EN
          </button>
        </div>

        {/* Notifications & Urgent Alert Drawer Button */}
        <div className="relative" ref={alertsRef}>
          <button
            onClick={() => setIsAlertsOpen((prev) => !prev)}
            title={t("header.notifications")}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {urgentCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {urgentCount}
              </span>
            )}
          </button>

          {/* Urgent Alerts Popover */}
          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-700 text-lg">
                    notification_important
                  </span>
                  <h4 className="font-bold text-xs text-on-surface font-headline uppercase tracking-wider">
                    {t("header.notifications")}
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                  {urgentCount} активных
                </span>
              </div>

              <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                {urgentRequests.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    {t("header.noUrgentAlerts")}
                  </div>
                ) : (
                  urgentRequests.slice(0, 5).map((req) => (
                    <div
                      key={req.id}
                      onClick={() => {
                        setIsAlertsOpen(false);
                        if (onNavigateTab) onNavigateTab("requests");
                      }}
                      className="p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100 flex flex-col gap-1 text-left"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                          {req.type} • {req.priority}
                        </span>
                        <span className="text-slate-400">
                          {req.roomId ? `Ауд. ${req.roomId}` : "Кампус"}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-on-surface line-clamp-1">
                        {req.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {req.description}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsAlertsOpen(false);
                    if (onNavigateTab) onNavigateTab("requests");
                  }}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  {t("header.viewAll")} →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Chip */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="h-9 w-9 rounded-xl overflow-hidden border border-slate-200 bg-red-100 flex items-center justify-center font-headline font-bold text-red-900 text-sm">
            П
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-on-surface leading-tight font-headline">
              {adminName}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight font-body">
              {adminEmail}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
