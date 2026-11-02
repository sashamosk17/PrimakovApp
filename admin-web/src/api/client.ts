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

// Response interceptor to handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("primakov_admin_token");
      localStorage.removeItem("primakov_admin_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);
