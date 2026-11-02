import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center border border-red-100 shadow-xl space-y-4">
            <div className="w-16 h-16 bg-red-50 text-[#BA1A1A] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-3xl">error_outline</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {this.props.fallbackMessage || "Произошла непредвиденная ошибка в интерфейсе"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {this.state.error?.message ||
                "Мы зафиксировали сбой. Пожалуйста, попробуйте повторить действие или обновить компонент."}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2.5 bg-[#BA1A1A] hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md shadow-red-900/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Повторить попытку
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
