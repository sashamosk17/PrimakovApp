import React, { useState } from "react";
import { getApiBaseUrl, setApiBaseUrl } from "../api/client";
import { useLanguage } from "../context/LanguageContext";

interface LoginModalProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onDemoLogin?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onDemoLogin }) => {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("admin@primakov.school");
  const [password, setPassword] = useState("password123");
  const [serverUrl, setServerUrlState] = useState(getApiBaseUrl());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleServerChange = (url: string) => {
    setServerUrlState(url);
    setApiBaseUrl(url);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      if (err?.code === "ERR_NETWORK" || err?.message?.includes("Network Error")) {
        setError(
          language === "en"
            ? `Network error: Server unavailable at ${serverUrl}. Start the local backend (npm run dev in backend directory) or switch to VPS (185.221.198.242:3000).`
            : `Ошибка сети: сервер недоступен по адресу ${serverUrl}. Запустите локальный бэкенд (npm run dev в папке backend) или переключитесь на VPS (185.221.198.242:3000).`
        );
      } else {
        setError(
          err?.response?.data?.error?.message ||
            err?.message ||
            (language === "en" ? "Invalid admin email or password" : "Неверный логин или пароль администратора")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface p-4">
      <div className="bg-surface-container-lowest rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in duration-200">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-red-100 text-primary font-bold text-2xl rounded-2xl flex items-center justify-center mx-auto mb-4 font-headline shadow-sm">
            П
          </div>
          <h2 className="text-2xl font-black text-on-surface font-headline tracking-tight">
            {language === "en" ? "Primakov Gymnasium" : "Гимназия им. Примакова"}
          </h2>
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider mt-1 font-headline">
            {language === "en" ? "Administrative Portal" : "Административная панель управления"}
          </p>
        </div>

        {/* Server connection picker */}
        <div className="mb-6 p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">
            {language === "en" ? "Target API Server:" : "Целевой сервер API:"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleServerChange("http://localhost:3000/api")}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                serverUrl.includes("localhost")
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {language === "en" ? "Local (3000)" : "Локальный (3000)"}
            </button>
            <button
              type="button"
              onClick={() => handleServerChange("http://185.221.198.242:3000/api")}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                serverUrl.includes("185.221.198.242")
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {language === "en" ? "VPS Server (Prod)" : "VPS Сервер (Прод)"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 text-red-800 text-xs font-medium leading-relaxed border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              {t("modals.email")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              {t("modals.password")}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-container transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (language === "en" ? "Authenticating..." : "Авторизация...") : t("modals.loginTitle")}
          </button>

          {onDemoLogin && (
            <div className="pt-2">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">{language === "en" ? "or" : "или"}</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
              <button
                type="button"
                onClick={onDemoLogin}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">visibility</span>
                {language === "en" ? "Enter Demo Mode (UI preview)" : "Войти в Демо-режиме (предпросмотр UI)"}
              </button>
            </div>
          )}
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            {language === "en" ? "Access restricted to accounts with ADMIN / SUPERADMIN roles" : "Доступ строго для учетных записей с ролью ADMIN / SUPERADMIN"}
          </p>
        </div>
      </div>
    </div>
  );
};
