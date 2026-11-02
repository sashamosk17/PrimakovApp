import React from "react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  adminName?: string;
  adminEmail?: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  adminName = "Администратор",
  adminEmail = "admin@primakov.school",
}) => {
  return (
    <header className="flex justify-between items-center w-full px-8 py-4 sticky top-0 bg-white/90 backdrop-blur-lg z-40 border-b border-slate-100">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-extrabold tracking-widest text-red-900 uppercase font-headline">
          Elite Academy Admin
        </h2>
        <div className="hidden md:flex bg-slate-100/70 rounded-full px-4 py-1.5 items-center gap-2 w-72 ml-4">
          <span className="material-symbols-outlined text-slate-400 text-sm">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск записей, учеников, заявок..."
            className="bg-transparent border-none text-xs focus:ring-0 focus:outline-none w-full placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          title="Уведомления"
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
        </button>

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

