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
    <aside className="h-screen w-72 fixed left-0 top-0 overflow-y-auto bg-slate-50 dark:bg-slate-900 flex flex-col gap-2 p-6 z-50 border-r border-slate-100">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-black text-red-900 dark:text-red-500 italic font-headline tracking-wide">
          {t("nav.school")}
        </h1>
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase mt-0.5">
          {t("nav.portal")}
        </p>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer font-headline text-sm font-semibold tracking-wide ${
                isActive
                  ? "bg-white text-red-900 shadow-sm"
                  : "text-slate-600 hover:text-red-800 hover:translate-x-1"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-200 space-y-2">
        <button
          onClick={onOpenAddUser}
          className="w-full py-3 px-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm font-headline cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {t("nav.enrollment")}
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 text-slate-600 hover:text-red-800 font-headline text-sm font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">logout</span>
          {t("nav.logout")}
        </button>
      </div>
    </aside>
  );
};
