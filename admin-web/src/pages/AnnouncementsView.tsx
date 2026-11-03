import React, { useState, useMemo } from "react";
import type { Announcement } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";

interface AnnouncementsViewProps {
  announcements: Announcement[];
  onCreateAnnouncement: (title: string, category: string, content: string) => void;
  onUpdateAnnouncement?: (id: string, title: string, category: string, content: string) => Promise<void>;
  onDeleteAnnouncement?: (id: string) => Promise<void>;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  onCreateAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
}) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Кампус");
  const [targetAudience, setTargetAudience] = useState("Всем учащимся и учителям");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Editing state
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    const fullContent = targetAudience && targetAudience !== "Всем учащимся и учителям"
      ? `[Аудитория: ${targetAudience}]\n${content}`
      : content;
    onCreateAnnouncement(title, category, fullContent);
    showToast("Объявление успешно опубликовано", "success");
    setTitle("");
    setContent("");
  };

  const openEditModal = (a: Announcement) => {
    setEditingAnnouncement(a);
    setEditTitle(a.title);
    setEditCategory(a.category);
    setEditContent(a.content);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement || !onUpdateAnnouncement) return;
    try {
      setIsUpdating(true);
      await onUpdateAnnouncement(editingAnnouncement.id, editTitle, editCategory, editContent);
      showToast("Объявление успешно обновлено", "success");
      setEditingAnnouncement(null);
    } catch (err: any) {
      showToast(err.message || "Ошибка обновления", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string, annTitle: string) => {
    if (confirm(`Удалить объявление "${annTitle}"?`)) {
      if (onDeleteAnnouncement) {
        await onDeleteAnnouncement(id);
        showToast("Объявление удалено", "info");
      }
    }
  };

  const filtered = useMemo(() => {
    if (!searchQuery) return announcements;
    const q = searchQuery.toLowerCase();
    return announcements.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [announcements, searchQuery]);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h3 className="text-3xl font-extrabold text-on-surface font-display tracking-tight flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">campaign</span>
          {t("ann.title")}
        </h3>
        <p className="text-xs text-secondary mt-0.5">
          {t("ann.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create form */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-3xl border border-slate-100 shadow-xs h-fit">
          <h4 className="text-base font-bold font-headline mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">campaign</span>
            {t("ann.new")}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Заголовок
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Праздничный концерт ко Дню Гимназии"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  {t("ann.category")}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-medium cursor-pointer"
                >
                  <option value="Кампус">Кампус</option>
                  <option value="Учеба">Учеба</option>
                  <option value="Персонал">Персонал</option>
                  <option value="Мероприятия">Мероприятия</option>
                  <option value="Олимпиады">Олимпиады</option>
                  <option value="IB World School">IB World School</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  {t("ann.audience")}
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-medium cursor-pointer"
                >
                  <option value="Всем учащимся и учителям">Всем в гимназии</option>
                  <option value="Ученики 1–4 классов">Начальная школа (1–4)</option>
                  <option value="Ученики 5–9 классов">Основная школа (5–9)</option>
                  <option value="Ученики 10–11 классов">Старшая школа (10–11)</option>
                  <option value="Преподавательский состав">Только преподавателям</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Текст объявления
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Подробная информация для гимназистов, время и место проведения..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-body leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-container transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              {t("ann.publishBtn")}
            </button>
          </form>
        </div>

        {/* Announcements List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-base font-bold font-headline text-on-surface">
              {t("ann.published")} ({filtered.length})
            </h4>

            {/* Quick search input */}
            <div className="relative w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по объявлениям..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              />
              <span className="material-symbols-outlined absolute left-2 top-2 text-slate-400 text-sm">
                search
              </span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-400 text-xs">
              Объявления не найдены
            </div>
          ) : (
            filtered.map((a) => (
              <div
                key={a.id}
                className="bg-surface-container-lowest p-5 rounded-3xl border border-slate-100 shadow-xs space-y-2 hover:shadow-md transition-shadow relative group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-primary text-[10px] font-black uppercase tracking-wider">
                      {a.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">
                      {new Date(a.publishedAt).toLocaleDateString("ru-RU")}
                    </span>

                    {onUpdateAnnouncement && (
                      <button
                        onClick={() => openEditModal(a)}
                        title="Редактировать объявление"
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    )}

                    {onDeleteAnnouncement && (
                      <button
                        onClick={() => handleDelete(a.id, a.title)}
                        title={t("ann.delete")}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>
                </div>

                <h5 className="font-bold text-sm text-on-surface">{a.title}</h5>
                <p className="text-xs text-secondary leading-relaxed whitespace-pre-line">{a.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Announcement Modal */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h4 className="text-lg font-bold font-headline text-slate-900">
                Редактировать объявление
              </h4>
              <button
                onClick={() => setEditingAnnouncement(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Заголовок
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Категория
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                  <option value="Кампус">Кампус</option>
                  <option value="Учеба">Учеба</option>
                  <option value="Персонал">Персонал</option>
                  <option value="Мероприятия">Мероприятия</option>
                  <option value="Олимпиады">Олимпиады</option>
                  <option value="IB World School">IB World School</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Содержание
                </label>
                <textarea
                  required
                  rows={5}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-body leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAnnouncement(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-primary hover:bg-primary-container text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? "Сохранение..." : "Сохранить изменения"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
