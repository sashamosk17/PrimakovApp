import React from "react";
import type { TeacherRating } from "../types";

interface RatingsViewProps {
  ratings: TeacherRating[];
}

export const RatingsView: React.FC<RatingsViewProps> = ({ ratings }) => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h3 className="text-3xl font-extrabold text-on-surface font-display tracking-tight">
          Модерация Рейтингов Учителей
        </h3>
        <p className="text-xs text-secondary mt-0.5">
          Анонимные отзывы учеников с открытой модераторской информацией для администрации
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="py-3.5 px-6">Преподаватель ID</th>
              <th className="py-3.5 px-4">Автор ID (Admin view)</th>
              <th className="py-3.5 px-4">Оценка</th>
              <th className="py-3.5 px-4">Отзыв / Комментарий</th>
              <th className="py-3.5 px-6">Дата</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {ratings.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Рейтинги пока не оставлены
                </td>
              </tr>
            ) : (
              ratings.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-bold text-on-surface">
                    {r.teacherId}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-500 text-[11px]">
                    {r.userId}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                      ★ {r.value} / 10
                    </span>
                  </td>
                  <td className="py-4 px-4 text-secondary max-w-md">
                    {r.comment || "—"}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
