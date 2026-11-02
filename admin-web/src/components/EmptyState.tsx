import React from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "inbox",
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`text-center py-12 px-6 bg-white/80 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100/80 shadow-inner">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h4 className="text-sm font-bold text-slate-700">{title}</h4>
      {description && (
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

