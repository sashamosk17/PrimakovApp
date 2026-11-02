import React from "react";
import { useLanguage } from "../context/LanguageContext";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenAddUser: () => void;
  onLogout: () => void;
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onOpenAddUser,
  onLogout,
}) => {
  const { t } = useLanguage();

  const navItems = [
    { id: "dashboard", label: t("nav.dashboard"), icon: "dashboard" },
    { id: "users", label: t("nav.users"), icon: "school" },
    { id: "schedule", label: t("nav.schedule"), icon: "calendar_month" },
    { id: "canteen", label: t("nav.canteen"), icon: "restaurant_menu" },
    { id: "requests", label: t("nav.requests"), icon: "pending_actions" },
    { id: "ratings", label: t("nav.ratings"), icon: "badge" },
    { id: "announcements", label: t("nav.announcements"), icon: "campaign" },
  ];

  return (
    <aside className="h-screen w-72 fixed left-0 top-0 overflow-y-auto bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-xl flex flex-col gap-2 p-6 z-50 border-r border-slate-200/60 dark:border-slate-800">
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center text-white shadow-md shadow-red-900/20">
          <span className="material-symbols-outlined text-xl">account_balance</span>
        </div>
        <div>
          <h1 className="text-lg font-black text-red-900 dark:text-red-400 font-headline tracking-tight leading-tight">
            {t("nav.school")}
          </h1>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {t("nav.portal")}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all cursor-pointer font-headline text-sm font-semibold tracking-tight ${
                isActive
                  ? "bg-white dark:bg-slate-800 text-red-900 dark:text-red-400 shadow-sm shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/60 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive ? "text-red-800 dark:text-red-400" : "text-slate-400"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-4 rounded-full bg-red-800 dark:bg-red-500" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5">
        <button
          onClick={onOpenAddUser}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-950/20 hover:scale-[1.01] active:scale-[0.98] transition-all text-sm font-headline cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          {t("nav.enrollment")}
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:text-red-800 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-slate-800/50 font-headline text-sm font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          {t("nav.logout")}
        </button>
      </div>
    </aside>
  );
};
