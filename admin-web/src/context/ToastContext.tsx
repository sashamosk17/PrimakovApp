import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, description?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", description?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = { id, type, message, description };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  React.useEffect(() => {
    const handleApiError = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; status?: number }>;
      if (customEvent.detail && customEvent.detail.message) {
        showToast(customEvent.detail.message, "error");
      }
    };

    window.addEventListener("primakov:api-error", handleApiError);
    return () => {
      window.removeEventListener("primakov:api-error", handleApiError);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isError = toast.type === "error";
          const isSuccess = toast.type === "success";
          const isWarning = toast.type === "warning";

          const bgBorderColor = isError
            ? "bg-red-50/95 border-red-200 text-[#BA1A1A]"
            : isSuccess
            ? "bg-emerald-50/95 border-emerald-200 text-emerald-900"
            : isWarning
            ? "bg-amber-50/95 border-amber-200 text-amber-900"
            : "bg-slate-50/95 border-slate-200 text-slate-800";

          const iconName = isError
            ? "error"
            : isSuccess
            ? "check_circle"
            : isWarning
            ? "warning"
            : "info";

          const iconColor = isError
            ? "text-[#BA1A1A]"
            : isSuccess
            ? "text-emerald-600"
            : isWarning
            ? "text-amber-600"
            : "text-blue-600";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl border shadow-xl backdrop-blur-md flex items-start gap-3 animate-slideUp transition-all duration-300 ${bgBorderColor}`}
            >
              <span className={`material-symbols-outlined text-xl mt-0.5 shrink-0 ${iconColor}`}>
                {iconName}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-snug">{toast.message}</p>
                {toast.description && (
                  <p className="text-[11px] opacity-80 mt-1 leading-normal">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-50 hover:opacity-100 transition-opacity p-0.5 text-xs font-bold cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
