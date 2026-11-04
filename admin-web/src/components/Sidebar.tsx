import React from "react";
import { useLanguage } from "../context/LanguageContext";
import primakovLogo from "../assets/primakov_logo.png";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenAddUser?: () => void;
  onLogout: () => void;
  userEmail?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
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
    { id: "stories", label: t("nav.stories"), icon: "auto_stories" },
    { id: "houses", label: t("nav.houses"), icon: "shield" },
    { id: "boarding", label: t("nav.boarding"), icon: "hotel" },
    { id: "audit", label: t("nav.audit"), icon: "shield_person" },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`h-screen w-72 fixed left-0 top-0 overflow-y-auto bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xl flex flex-col gap-2 p-6 z-50 border-r border-slate-200/60 dark:border-slate-800 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="mb-8 px-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center p-1.5 shadow-md shadow-red-950/10 border border-slate-200/70 dark:border-slate-700/60 shrink-0 overflow-hidden">
              <img
                src={primakovLogo}
                alt="Primakov School Logo"
                className="w-full h-full object-contain"
              />
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
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Закрыть меню"
              aria-label="Закрыть меню"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile?.();
                }}
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
            onClick={() => {
              onLogout();
              onCloseMobile?.();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:text-red-800 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-slate-800/50 font-headline text-sm font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            {t("nav.logout")}
          </button>
        </div>
      </aside>
    </>
  );
};
