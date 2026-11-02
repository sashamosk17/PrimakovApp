import React, { useState } from "react";
import type { User, Role } from "../types";

interface UsersViewProps {
  users: User[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onSearch: (q: string) => void;
  onRoleFilter: (role?: Role) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDeleteUser: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  selectedRole?: Role;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  totalUsers,
  currentPage,
  totalPages,
  onPageChange,
  onSearch,
  onRoleFilter,
  onToggleStatus,
  onDeleteUser,
  onOpenAddModal,
  onOpenImportModal,
  selectedRole,
}) => {
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const roles: { label: string; value?: Role }[] = [
    { label: "Все" },
    { label: "Ученики", value: "STUDENT" },
    { label: "Учителя", value: "TEACHER" },
    { label: "Администраторы", value: "ADMIN" },
  ];

  const exportCsv = () => {
    const headers = "id,firstName,lastName,email,role,isActive\n";
    const rows = users
      .map(
        (u) =>
          `"${u.id}","${u.firstName}","${u.lastName}","${u.email}","${u.role}","${u.isActive}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `primakov_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-on-surface font-display tracking-tight">
            Управление Пользователями
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Всего пользователей в системе: {totalUsers}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportCsv}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Экспорт CSV
          </button>

          <button
            onClick={onOpenImportModal}
            className="px-4 py-2.5 bg-surface-container-highest rounded-xl text-xs font-bold text-on-surface hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-primary">upload_file</span>
            Импорт CSV
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-md shadow-primary/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Добавить пользователя
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-4">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {roles.map((r) => {
            const isSelected = selectedRole === r.value;
            return (
              <button
                key={r.label}
                onClick={() => onRoleFilter(r.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Поиск по ФИО или email..."
              className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary w-64"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-sm">
              search
            </span>
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
          >
            Найти
          </button>
        </form>
      </div>

      {/* Users Data Table */}
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Пользователь</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Роль</th>
                <th className="py-3.5 px-4">Статус</th>
                <th className="py-3.5 px-4">Регистрация</th>
                <th className="py-3.5 px-6 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const initials = `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-red-50 text-primary font-bold flex items-center justify-center text-xs">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-on-surface">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-[10px] text-slate-400">ID: {u.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-600">
                        {u.email}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === "ADMIN" || u.role === "SUPERADMIN"
                              ? "bg-red-50 text-red-800 border border-red-200"
                              : u.role === "TEACHER"
                              ? "bg-purple-50 text-purple-800 border border-purple-200"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <button
                          onClick={() => onToggleStatus(u.id, !u.isActive)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            u.isActive
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? "bg-green-500" : "bg-slate-400"
                            }`}
                          ></span>
                          {u.isActive ? "Активен" : "Отключен"}
                        </button>
                      </td>

                      <td className="py-4 px-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              if (confirm(`Удалить пользователя ${u.firstName} ${u.lastName}?`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            title="Удалить"
                            className="p-1 text-slate-400 hover:text-red-700 transition-colors rounded-lg hover:bg-slate-100 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="py-3 px-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs text-secondary">
          <p>
            Страница <span className="font-bold text-on-surface">{currentPage}</span> из{" "}
            <span className="font-bold text-on-surface">{totalPages}</span>
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-slate-50"
            >
              ← Назад
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-slate-50"
            >
              Вперед →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
