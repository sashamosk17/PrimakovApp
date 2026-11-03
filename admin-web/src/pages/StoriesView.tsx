import React, { useState, useMemo } from "react";
import type { Story } from "../types";
import { useToast } from "../context/ToastContext";

interface StoriesViewProps {
  stories: Story[];
  onCreateStory: (story: {
    title: string;
    description: string;
    imageUrl?: string;
    linkUrl?: string;
    linkText?: string;
    expiresInDays?: number;
  }) => Promise<void>;
  onUpdateStory: (id: string, story: {
    title: string;
    description: string;
    imageUrl?: string;
    linkUrl?: string;
    linkText?: string;
    expiresInDays?: number;
  }) => Promise<void>;
  onDeleteStory: (id: string) => Promise<void>;
}

const PRESET_IMAGES = [
  { label: "Модель ООН", url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80" },
  { label: "Космос и наука", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80" },
  { label: "Спорт и турниры", url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80" },
  { label: "Кампус Раздоры", url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80" },
  { label: "Концерт и бал", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80" },
];

export const StoriesView: React.FC<StoriesViewProps> = ({
  stories,
  onCreateStory,
  onUpdateStory,
  onDeleteStory,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("Подробнее");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingStory(null);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setLinkUrl("");
    setLinkText("Подробнее");
    setExpiresInDays(7);
    setIsModalOpen(true);
  };

  const openEditModal = (story: Story) => {
    setEditingStory(story);
    setTitle(story.title);
    setDescription(story.description);
    setImageUrl(story.imageUrl || "");
    setLinkUrl(story.linkUrl || "");
    setLinkText(story.linkText || "Подробнее");
    setExpiresInDays(7);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast("Заполните заголовок и описание", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingStory) {
        await onUpdateStory(editingStory.id, {
          title: title.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
          linkUrl: linkUrl.trim() || undefined,
          linkText: linkText.trim() || undefined,
          expiresInDays,
        });
        showToast("История успешно обновлена", "success");
      } else {
        await onCreateStory({
          title: title.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
          linkUrl: linkUrl.trim() || undefined,
          linkText: linkText.trim() || undefined,
          expiresInDays,
        });
        showToast("История успешно опубликована в приложении", "success");
      }
      closeModal();
    } catch (err: any) {
      showToast(err.message || "Ошибка сохранения истории", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, storyTitle: string) => {
    if (confirm(`Удалить историю "${storyTitle}"?`)) {
      try {
        await onDeleteStory(id);
        showToast("История удалена", "info");
      } catch (err: any) {
        showToast(err.message || "Ошибка удаления", "error");
      }
    }
  };

  const filtered = useMemo(() => {
    if (!searchQuery) return stories;
    const q = searchQuery.toLowerCase();
    return stories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.linkText && s.linkText.toLowerCase().includes(q))
    );
  }, [stories, searchQuery]);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-on-surface font-display tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">auto_stories</span>
            Истории гимназии (Stories)
          </h3>
          <p className="text-xs text-secondary mt-1">
            Публикация интерактивных историй для мобильного приложения с медиа, коротким текстом и кнопками-ссылками.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-2xl text-xs shadow-md shadow-primary/25 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          Опубликовать историю
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex justify-between items-center bg-surface-container-lowest p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по историям..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-sm">
            search
          </span>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Всего историй: <span className="font-bold text-slate-800">{filtered.length}</span>
        </div>
      </div>

      {/* Stories Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-400 text-xs">
          Истории не найдены. Создайте первую историю для учеников!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => {
            const isExpired = new Date(s.expiresAt) < new Date();
            const expiresFormatted = new Date(s.expiresAt).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "short",
            });

            return (
              <div
                key={s.id}
                className="bg-surface-container-lowest rounded-3xl border border-slate-100 shadow-xs overflow-hidden hover:shadow-lg transition-all flex flex-col group relative"
              >
                {/* Visual Thumbnail */}
                <div className="h-44 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  {s.imageUrl ? (
                    <img
                      src={s.imageUrl}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-950 via-red-900 to-slate-900 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white/30 text-5xl">school</span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                        isExpired
                          ? "bg-slate-900/80 text-slate-400"
                          : "bg-emerald-600/90 text-white shadow-sm"
                      }`}
                    >
                      {isExpired ? "Архив" : "Активна"}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-xs">visibility</span>
                    <span>{s.viewedBy?.length || 0}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-on-surface line-clamp-2 leading-snug">
                      {s.title}
                    </h4>
                    <p className="text-xs text-secondary mt-1.5 line-clamp-3 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  {/* Link Preview if exists */}
                  {s.linkUrl && (
                    <div className="p-2.5 bg-red-50/70 border border-red-100 rounded-xl flex items-center justify-between text-xs text-red-950">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="material-symbols-outlined text-primary text-sm flex-shrink-0">
                          link
                        </span>
                        <span className="truncate font-semibold">
                          {s.linkText || "Подробнее"}
                        </span>
                      </div>
                      <a
                        href={s.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-primary hover:underline flex items-center gap-0.5 flex-shrink-0"
                      >
                        Перейти
                        <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                      </a>
                    </div>
                  )}

                  {/* Expiration date & actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      до {expiresFormatted}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Редактировать историю"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.title)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                        title="Удалить историю"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create / Edit Story */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h4 className="text-xl font-bold font-headline text-slate-900">
                  {editingStory ? "Редактировать историю" : "Новая история для гимназистов"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  История появится в карусели на главном экране мобильного приложения
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Заголовок истории *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: 30-я юбилейная конференция Модель ООН"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Краткое описание / Текст *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Короткий анонс или важная информация, которая отображается на карточке сторис..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-normal leading-relaxed"
                />
              </div>

              {/* Image URL & Presets */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Изображение (URL или готовый пресет)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... или выберите пресет ниже"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 py-1 mr-1">Быстрые пресеты:</span>
                  {PRESET_IMAGES.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setImageUrl(p.url)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-all ${
                        imageUrl === p.url
                          ? "bg-primary text-white border-primary"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Интерактивная ссылка (URL)
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://primakov.school/..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Текст на кнопке ссылки
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Подробнее / Подать заявку"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                  />
                </div>
              </div>

              {/* Expiry Days */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Срок действия истории
                </label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium cursor-pointer"
                >
                  <option value={1}>1 день (срочный анонс)</option>
                  <option value={3}>3 дня</option>
                  <option value={7}>7 дней (стандартная неделя)</option>
                  <option value={14}>14 дней (две недели)</option>
                  <option value={30}>30 дней (месяц)</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white font-bold text-xs rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Сохранение..."
                    : editingStory
                    ? "Сохранить изменения"
                    : "Опубликовать историю"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

