import React from "react";

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
  const navItems = [
    { id: "dashboard", label: "Дашборд", icon: "dashboard" },
    { id: "users", label: "Пользователи", icon: "school" },
    { id: "schedule", label: "Расписание и предметы", icon: "calendar_month" },
    { id: "requests", label: "Заявки", icon: "pending_actions" },
    { id: "ratings", label: "Рейтинги учителей", icon: "badge" },
    { id: "announcements", label: "Объявления", icon: "campaign" },
  ];

  return (
    <aside className="h-screen w-72 fixed left-0 top-0 overflow-y-auto bg-slate-50 dark:bg-slate-900 flex flex-col gap-2 p-6 z-50 border-r border-slate-100">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-black text-red-900 dark:text-red-500 italic font-headline tracking-wide">
          Гимназия Примакова
        </h1>
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase mt-0.5">
          Institutional Portal
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
          className="w-full py-3 px-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm font-headline"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Новое зачисление
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 text-slate-600 hover:text-red-800 font-headline text-sm font-semibold transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          Выйти
        </button>
      </div>
    </aside>
  );
};

