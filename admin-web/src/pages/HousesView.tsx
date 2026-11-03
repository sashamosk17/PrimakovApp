import React, { useState } from "react";
import type { HouseStanding, HouseTransaction } from "../types";
import { useToast } from "../context/ToastContext";

interface HousesViewProps {
  standings: HouseStanding[];
  transactions: HouseTransaction[];
  onAwardPoints: (data: {
    house: string;
    points: number;
    category: string;
    reason: string;
    studentId?: string;
  }) => Promise<void>;
}

const HOUSE_THEMES: Record<string, { name: string; emblem: string; gradient: string; border: string; text: string; bg: string }> = {
  NORTH: {
    name: "Север (North)",
    emblem: "ac_unit",
    gradient: "from-sky-700 to-blue-900",
    border: "border-sky-300 dark:border-sky-800",
    text: "text-sky-700 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/30",
  },
  SOUTH: {
    name: "Юг (South)",
    emblem: "wb_sunny",
    gradient: "from-amber-600 to-orange-800",
    border: "border-amber-300 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  EAST: {
    name: "Восток (East)",
    emblem: "forest",
    gradient: "from-emerald-700 to-teal-900",
    border: "border-emerald-300 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  WEST: {
    name: "Запад (West)",
    emblem: "local_fire_department",
    gradient: "from-red-700 to-rose-950",
    border: "border-red-300 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
};

const CATEGORIES = [
  { id: "ACADEMIC", label: "Учебные успехи" },
  { id: "OLYMPIAD", label: "ВсОШ и олимпиады" },
  { id: "SPORTS", label: "Спорт и спартакиады" },
  { id: "CHARITY", label: "Благотворительность" },
  { id: "CULTURE", label: "Творчество и культура" },
];

export const HousesView: React.FC<HousesViewProps> = ({
  standings,
  transactions,
  onAwardPoints,
}) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [house, setHouse] = useState("NORTH");
  const [points, setPoints] = useState(25);
  const [category, setCategory] = useState("ACADEMIC");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalize standings to 4 houses if partial
  const allHouses = ["NORTH", "SOUTH", "EAST", "WEST"];
  const displayStandings = allHouses.map((hKey) => {
    const existing = standings.find((s) => s.house.toUpperCase() === hKey);
    return (
      existing || {
        house: hKey,
        totalPoints: 0,
        rank: 4,
      }
    );
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast("Укажите причину начисления баллов", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await onAwardPoints({
        house,
        points: Number(points),
        category,
        reason: reason.trim(),
      });
      showToast(`Начислено +${points} баллов Дому ${HOUSE_THEMES[house]?.name}`, "success");
      setReason("");
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Ошибка начисления баллов", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-on-surface font-display tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">shield</span>
            Лига Домов (House Cup)
          </h3>
          <p className="text-xs text-secondary mt-1">
            Кубок Домов Гимназии им. Е. М. Примакова: Север, Юг, Восток, Запад. Начисление баллов и аудит транзакций.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white font-bold rounded-2xl text-xs shadow-md shadow-red-950/20 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-base">military_tech</span>
          Начислить баллы Дому
        </button>
      </div>

      {/* 4 Houses Standings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStandings.map((s, index) => {
          const theme = HOUSE_THEMES[s.house.toUpperCase()] || HOUSE_THEMES.WEST;
          const isLeader = index === 0 && s.totalPoints > 0;

          return (
            <div
              key={s.house}
              className={`rounded-3xl p-6 bg-surface-container-lowest border ${
                isLeader ? "border-amber-400 shadow-md ring-2 ring-amber-300/30" : "border-slate-100 shadow-xs"
              } relative overflow-hidden transition-all hover:shadow-lg`}
            >
              {/* Leader Ribbon */}
              {isLeader && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-400 text-amber-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                  <span className="material-symbols-outlined text-xs">emoji_events</span>
                  Лидер
                </div>
              )}

              <div className="flex items-center gap-3.5 mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.gradient} text-white flex items-center justify-center shadow-md`}>
                  <span className="material-symbols-outlined text-2xl">{theme.emblem}</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-on-surface font-headline">
                    {theme.name}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Место #{index + 1}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Всего баллов
                  </p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white font-headline tracking-tight">
                    {s.totalPoints}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setHouse(s.house.toUpperCase());
                    setIsModalOpen(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl ${theme.bg} ${theme.text} text-[11px] font-bold hover:opacity-80 transition-opacity cursor-pointer`}
                >
                  + Баллы
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transactions History */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-base font-bold font-headline text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">history_edu</span>
              Журнал начислений баллов
            </h4>
            <p className="text-xs text-secondary mt-0.5">
              Все последние транзакции баллов за олимпиады, спорт и академические достижения
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Записей: {transactions.length}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Транзакции пока отсутствуют. Начислите баллы за первые победы гимназистов!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Дом</th>
                  <th className="py-3 px-4">Баллы</th>
                  <th className="py-3 px-4">Категория</th>
                  <th className="py-3 px-4">Обоснование</th>
                  <th className="py-3 px-4">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => {
                  const theme = HOUSE_THEMES[t.house?.toUpperCase()] || HOUSE_THEMES.WEST;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${theme.bg} ${theme.text}`}>
                          <span className="material-symbols-outlined text-xs">{theme.emblem}</span>
                          {t.house}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-sm text-emerald-600">
                          +{t.points}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-[10px]">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {t.reason}
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Award Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h4 className="text-lg font-bold font-headline text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-xl">military_tech</span>
                Начислить баллы Дому
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Выберите Дом
                </label>
                <select
                  value={house}
                  onChange={(e) => setHouse(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-bold cursor-pointer"
                >
                  <option value="NORTH">Север (North)</option>
                  <option value="SOUTH">Юг (South)</option>
                  <option value="EAST">Восток (East)</option>
                  <option value="WEST">Запад (West)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Количество баллов
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={500}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Категория
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-medium cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Обоснование начисления *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Например: Победитель регионального этапа ВсОШ по физике..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-body"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-red-800 to-red-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Начисление..." : "Подтвердить и начислить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

