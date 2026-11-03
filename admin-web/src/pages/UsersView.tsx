import React, { useState, useMemo } from "react";
import type { User, Role } from "../types";
import { ALL_GYMNASIUM_CLASSES } from "./ScheduleView";
import { EditUserModal } from "../components/EditUserModal";
import { UserProfileModal } from "../components/UserProfileModal";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";

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
  onUpdateUser?: (id: string, updatedData: any) => Promise<void>;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenImportMeshModal?: () => void;
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
  onUpdateUser,
  onOpenAddModal,
  onOpenImportModal,
  onOpenImportMeshModal,
  selectedRole,
}) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingProfileUser, setViewingProfileUser] = useState<User | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const roles: { label: string; value?: Role }[] = [
    { label: t("users.all") },
    { label: t("users.students"), value: "STUDENT" },
    { label: t("users.teachers"), value: "TEACHER" },
    { label: t("users.admins"), value: "ADMIN" },
  ];

  // Filter users by selected class (client-side refinement)
  const displayedUsers = useMemo(() => {
    if (selectedClass === "ALL") return users;
    return users.filter((u) => u.groupName === selectedClass);
  }, [users, selectedClass]);

  const exportCsv = () => {
    const headers = "id,firstName,lastName,email,role,groupName,isActive\n";
    const rows = displayedUsers
      .map(
        (u) =>
          `"${u.id}","${u.firstName}","${u.lastName}","${u.email}","${u.role}","${u.groupName || ""}","${u.isActive}"`
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
    showToast("Файл CSV успешно экспортирован", "success");
  };

  const handleQuickPasswordReset = async (u: User) => {
    const tempPass = `Primakov${Math.floor(1000 + Math.random() * 9000)}!`;
    if (confirm(`Сбросить пароль для ${u.firstName} ${u.lastName}?\nНовый временный пароль: ${tempPass}`)) {
      if (onUpdateUser) {
        await onUpdateUser(u.id, { newPassword: tempPass });
        showToast(`Пароль для ${u.firstName} сброшен на: ${tempPass}`, "success");
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-on-surface font-display tracking-tight">
            {t("users.title")}
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            {t("users.total")} {totalUsers}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportCsv}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            {t("users.exportCsv")}
          </button>

          <button
            onClick={onOpenImportModal}
            className="px-4 py-2.5 bg-surface-container-highest rounded-xl text-xs font-bold text-on-surface hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-primary">upload_file</span>
            {t("users.importCsv")}
          </button>

          {onOpenImportMeshModal && (
            <button
              onClick={onOpenImportMeshModal}
              className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-900 hover:bg-red-100 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              title="Импорт оценок и ведомостей МЭШ"
            >
              <span className="material-symbols-outlined text-sm text-primary">grade</span>
              Импорт МЭШ
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-md shadow-primary/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            {t("users.addUser")}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-3xl shadow-xs border border-slate-100 flex flex-col lg:flex-row justify-between gap-4">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {roles.map((r) => {
            const isSelected = selectedRole === r.value;
            return (
              <button
                key={r.label}
                onClick={() => onRoleFilter(r.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {t("users.classFilter")}
            </span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-on-surface focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option value="ALL">{t("users.allClasses")}</option>
              {ALL_GYMNASIUM_CLASSES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search input form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("users.searchPlaceholder")}
                className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary w-56 sm:w-64"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-sm">
                search
              </span>
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
            >
              {t("users.searchBtn")}
            </button>
          </form>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-surface-container-lowest rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">{t("users.colUser")}</th>
                <th className="py-3.5 px-4">{t("users.colEmail")}</th>
                <th className="py-3.5 px-4">{t("users.colRole")}</th>
                <th className="py-3.5 px-4">{t("users.colStatus")}</th>
                <th className="py-3.5 px-4">{t("users.colRegistered")}</th>
                <th className="py-3.5 px-6 text-right">{t("users.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                displayedUsers.map((u) => {
                  const initials = `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td
                        className="py-4 px-6 cursor-pointer group"
                        onClick={() => setViewingProfileUser(u)}
                        title="Открыть карточку профиля"
                      >
                        <div className="flex items-center gap-3">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-red-50 text-primary font-bold flex items-center justify-center text-xs group-hover:bg-red-100 transition-colors">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-1.5">
                              <span>{u.firstName} {u.lastName}</span>
                              <span className="material-symbols-outlined text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                open_in_new
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              ID: {u.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-600">
                        {u.email}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col items-start gap-1">
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
                          {u.groupName && (
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                              Класс: {u.groupName}
                            </span>
                          )}
                        </div>
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
                          {u.isActive ? t("users.active") : t("users.disabled")}
                        </button>
                      </td>

                      <td className="py-4 px-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingProfileUser(u)}
                            title={t("users.viewProfile")}
                            className="p-1.5 text-slate-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-100 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">badge</span>
                          </button>

                          <button
                            onClick={() => setEditingUser(u)}
                            title={t("users.editUser")}
                            className="p-1.5 text-slate-500 hover:text-primary transition-colors rounded-lg hover:bg-slate-100 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>

                          <button
                            onClick={() => handleQuickPasswordReset(u)}
                            title={t("users.resetPass")}
                            className="p-1.5 text-slate-500 hover:text-amber-600 transition-colors rounded-lg hover:bg-slate-100 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">lock_reset</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Удалить пользователя ${u.firstName} ${u.lastName}?`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            title={t("users.delete")}
                            className="p-1.5 text-slate-400 hover:text-red-700 transition-colors rounded-lg hover:bg-slate-100 cursor-pointer"
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
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              ← Назад
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              Вперед →
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={async (id, data) => {
          if (onUpdateUser) {
            await onUpdateUser(id, data);
            showToast("Данные пользователя успешно обновлены", "success");
          }
        }}
      />

      {/* User Profile Modal */}
      {viewingProfileUser && (
        <UserProfileModal
          user={viewingProfileUser}
          onClose={() => setViewingProfileUser(null)}
          onEdit={(u) => {
            setViewingProfileUser(null);
            setEditingUser(u);
          }}
          onResetPassword={(u) => {
            handleQuickPasswordReset(u);
          }}
          onToggleStatus={(id, isActive) => {
            onToggleStatus(id, isActive);
            setViewingProfileUser((prev) => (prev ? { ...prev, isActive } : null));
          }}
        />
      )}
    </div>
  );
};
