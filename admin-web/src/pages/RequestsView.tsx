import React, { useState } from "react";
import type { ServiceRequest } from "../types";

interface RequestsViewProps {
  requests: ServiceRequest[];
  onUpdateRequest: (id: string, status: string, notes?: string) => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  onUpdateRequest,
}) => {
  const [filterType, setFilterType] = useState<string>("ALL");

  const filtered = requests.filter((r) => {
    if (filterType === "ALL") return true;
    return r.type === filterType;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-on-surface font-display tracking-tight">
            Сервисный Стол Заявок
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Управление заявками на ремонт, IT-поддержку и уборку
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "IT", "MAINTENANCE", "CLEANING"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === type
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-container-lowest text-slate-600 hover:bg-slate-100"
              }`}
            >
              {type === "ALL" ? "Все категории" : type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-3xl border border-slate-100">
            Заявки в данной категории отсутствуют
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="bg-surface-container-lowest p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                    {req.type}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.priority === "URGENT" || req.priority === "HIGH"
                        ? "bg-red-50 text-red-700"
                        : "bg-blue-50 text-blue-700"
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

                {req.roomId && (
                  <p className="mt-3 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-xs">meeting_room</span>
                    Аудитория: {req.roomId}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">
                  {req.status}
                </span>

                <div className="flex gap-1.5">
                  {req.status !== "COMPLETED" && (
                    <button
                      onClick={() => onUpdateRequest(req.id, "COMPLETED")}
                      className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      ✓ Выполнить
                    </button>
                  )}
                  {req.status === "PENDING" && (
                    <button
                      onClick={() => onUpdateRequest(req.id, "IN_PROGRESS")}
                      className="px-2.5 py-1 bg-primary text-white hover:bg-primary-container rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      В работу
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
