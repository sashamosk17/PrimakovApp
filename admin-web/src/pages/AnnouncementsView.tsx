import React, { useState } from "react";
import type { Announcement } from "../types";

interface AnnouncementsViewProps {
  announcements: Announcement[];
  onCreateAnnouncement: (title: string, category: string, content: string) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  onCreateAnnouncement,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Кампус");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    onCreateAnnouncement(title, category, content);
    setTitle("");
    setContent("");
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h3 className="text-3xl font-extrabold text-on-surface font-display tracking-tight">
          Объявления и Stories
        </h3>
        <p className="text-xs text-secondary mt-0.5">
          Публикация новостей гимназии и анонсов мероприятий
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create form */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="text-base font-bold font-headline mb-4">
            Новое объявление
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
                placeholder="Например: Праздничный концерт 25 мая"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Кампус">Кампус</option>
                <option value="Учеба">Учеба</option>
                <option value="Персонал">Персонал</option>
                <option value="Мероприятия">Мероприятия</option>
              </select>
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
                placeholder="Подробная информация для гимназистов..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-container transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Опубликовать
            </button>
          </form>
        </div>

        {/* Announcements List */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-base font-bold font-headline mb-4">
            Опубликованные объявления ({announcements.length})
          </h4>

          {announcements.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-400 text-xs">
              Объявлений пока нет
            </div>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                className="bg-surface-container-lowest p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2"
              >
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-primary text-[10px] font-black uppercase">
                    {a.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(a.publishedAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
                <h5 className="font-bold text-sm text-on-surface">{a.title}</h5>
                <p className="text-xs text-secondary leading-relaxed">{a.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
