import React, { useState } from "react";
import type { ServiceRequest } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";

interface RequestsViewProps {
  requests: ServiceRequest[];
  onUpdateRequest: (id: string, status: string, notes?: string, assigneeId?: string) => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  onUpdateRequest,
}) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [assigneeInput, setAssigneeInput] = useState("");

  const staffMembers = [
    { id: "staff-it-1", name: "Сергей Васильев (Ведущий инженер IT)" },
    { id: "staff-it-2", name: "Дмитрий Новиков (Сетевой администратор)" },
    { id: "staff-maint-1", name: "Александр Кузнецов (Главный завхоз)" },
    { id: "staff-maint-2", name: "Николай Сидоров (Мастер сантехники и электрики)" },
    { id: "staff-clean-1", name: "Елена Смирнова (Служба клининга)" },
  ];

  const filtered = requests.filter((r) => {
    if (filterType !== "ALL" && r.type !== filterType) return false;
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    return true;
  });

  const handleOpenResolutionModal = (req: ServiceRequest) => {
    setEditingRequest(req);
    setNotesInput(req.notes || "");
    setAssigneeInput(req.assigneeId || "");
  };

  const handleSaveResolution = (newStatus?: string) => {
    if (!editingRequest) return;
    const finalStatus = newStatus || editingRequest.status;
    onUpdateRequest(editingRequest.id, finalStatus, notesInput, assigneeInput || undefined);
    showToast("Статус и резолюция заявки сохранены", "success");
    setEditingRequest(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-on-surface font-display tracking-tight">
            {t("req.title")}
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            {t("req.subtitle")} • Всего заявок: {requests.length}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "IT", "MAINTENANCE", "CLEANING"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === type
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-container-lowest text-slate-600 hover:bg-slate-100"
              }`}
            >
              {type === "ALL" ? t("req.allCategories") : type}
            </button>
          ))}
        </div>
      </div>

      {/* Status Bar Filter */}
      <div className="bg-surface-container-lowest p-3 rounded-2xl border border-slate-100 flex items-center gap-2 overflow-x-auto shadow-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-2 mr-1">
          Статус:
        </span>
        {[
          { id: "ALL", label: t("req.allStatuses") },
          { id: "PENDING", label: t("req.pending"), badge: "bg-amber-50 text-amber-800" },
          { id: "IN_PROGRESS", label: t("req.inProgress"), badge: "bg-blue-50 text-blue-800" },
          { id: "COMPLETED", label: t("req.completed"), badge: "bg-green-50 text-green-800" },
          { id: "CANCELLED", label: t("req.cancelled"), badge: "bg-slate-100 text-slate-600" },
        ].map((s) => {
          const isSelected = filterStatus === s.id;
          const count = s.id === "ALL" ? requests.length : requests.filter((r) => r.status === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{s.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Request Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-3xl border border-slate-100">
            Заявки по выбранным фильтрам отсутствуют
          </div>
        ) : (
          filtered.map((req) => {
            const assignee = staffMembers.find((s) => s.id === req.assigneeId);
            return (
              <div
                key={req.id}
                className="bg-surface-container-lowest p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {req.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.priority === "URGENT" || req.priority === "HIGH"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {req.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-on-surface mb-1">
                    {req.title}
                  </h4>
                  <p className="text-xs text-secondary leading-relaxed line-clamp-3">
                    {req.description}
                  </p>

                  <div className="mt-3 space-y-1">
                    {req.roomId && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-xs">meeting_room</span>
                        Аудитория: {req.roomId}
                      </p>
                    )}
                    {assignee ? (
                      <p className="text-[11px] text-primary flex items-center gap-1 font-bold">
                        <span className="material-symbols-outlined text-xs">engineering</span>
                        {assignee.name.split(" ")[0]} {assignee.name.split(" ")[1]}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">person_add</span>
                        Исполнитель не назначен
                      </p>
                    )}
                    {req.notes && (
                      <p className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl mt-1 border border-slate-100 italic">
                        Резолюция: {req.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    req.status === "COMPLETED"
                      ? "bg-green-50 text-green-700"
                      : req.status === "IN_PROGRESS"
                      ? "bg-blue-50 text-blue-700"
                      : req.status === "CANCELLED"
                      ? "bg-slate-100 text-slate-500"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {req.status}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenResolutionModal(req)}
                      title="Управление заявкой"
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">tune</span>
                      Назначить / Заметка
                    </button>

                    {req.status !== "COMPLETED" && (
                      <button
                        onClick={() => onUpdateRequest(req.id, "COMPLETED")}
                        className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        ✓ Выполнено
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolution & Assignee Modal */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="glass-modal animate-modal-pop rounded-3xl p-6 sm:p-8 max-w-lg w-full flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-headline text-on-surface">
                  Управление заявкой #{editingRequest.id.slice(0, 8)}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  {editingRequest.title}
                </p>
              </div>
              <button
                onClick={() => setEditingRequest(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                  {t("req.assignee")}
                </label>
                <select
                  value={assigneeInput}
                  onChange={(e) => setAssigneeInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium cursor-pointer"
                >
                  <option value="">Не назначен (в общей очереди)</option>
                  {staffMembers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                  {t("req.resolveNotes")}
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Укажите комментарий мастера, причину неполадки или отчет о проделанной работе..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveResolution("IN_PROGRESS")}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold cursor-pointer"
                  >
                    В работу
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveResolution("COMPLETED")}
                    className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-bold cursor-pointer"
                  >
                    Выполнена
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveResolution("CANCELLED")}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold cursor-pointer"
                  >
                    Отклонить
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveResolution()}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-container shadow-sm cursor-pointer"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
