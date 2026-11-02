import axios from "axios";

// Determine default API base URL
export function getApiBaseUrl(): string {
  const savedUrl = localStorage.getItem("primakov_api_url");
  if (savedUrl) return savedUrl;

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // If running in browser and port is 3000 or on server domain, use relative /api
  if (typeof window !== "undefined" && window.location.port === "3000") {
    return "/api";
  }

  return "http://localhost:3000/api";
}

export function setApiBaseUrl(url: string) {
  localStorage.setItem("primakov_api_url", url);
  apiClient.defaults.baseURL = url;
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token and ensure fresh baseURL
apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = localStorage.getItem("primakov_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors gracefully
export function getFriendlyErrorMessage(error: any): string {
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "Превышено время ожидания ответа от сервера.";
    }
    return "Не удалось подключиться к серверу гимназии. Проверьте подключение к сети.";
  }

  const status = error.response.status;
  const backendMessage = error.response.data?.error?.message;

  if (backendMessage && typeof backendMessage === "string") {
    return backendMessage;
  }

  switch (status) {
    case 400:
      return "Некорректные параметры запроса или невалидные данные.";
    case 401:
      return "Сессия истекла или недействительна. Выполните повторный вход.";
    case 403:
      return "Доступ запрещен: недостаточно прав администратора.";
    case 404:
      return "Запрашиваемый объект не найден на сервере.";
    case 409:
      return "Конфликт данных: запись с такими параметрами уже существует.";
    case 500:
      return "Внутренняя ошибка сервера гимназии. Служба IT уведомлена.";
    default:
      return `Ошибка сервера (${status}). Пожалуйста, повторите попытку.`;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("primakov_admin_token");
      localStorage.removeItem("primakov_admin_user");
    }

    // Dispatch global event for Toasts
    if (typeof window !== "undefined") {
      const friendlyMsg = getFriendlyErrorMessage(error);
      window.dispatchEvent(
        new CustomEvent("primakov:api-error", {
          detail: {
            message: friendlyMsg,
            status: error.response?.status,
          },
        })
      );
    }

    return Promise.reject(error);
  }
);
