const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const ACCESS_TOKEN_KEY = "rastroom.access_token";
export const REFRESH_TOKEN_KEY = "rastroom.refresh_token";

export type ApiErrorPayload = {
  statusCode?: number;
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
};

export class ApiError extends Error {
  statusCode: number;
  errors?: Array<{ field?: string; message: string }>;

  constructor(payload: ApiErrorPayload, statusCode: number) {
    super(payload.message || "Erro na API");
    this.statusCode = payload.statusCode || statusCode;
    this.errors = payload.errors;
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

let isRefreshing = false;

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getAccessToken();

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !isRefreshing && path !== "/auth/refresh") {
    isRefreshing = true;
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) throw new Error("Sem refresh token");

      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) throw new Error("Refresh inválido");

      const data = await res.json();
      setTokens(data.access_token, data.refresh_token);

      headers.set("Authorization", `Bearer ${data.access_token}`);
      const retry = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });
      const retryText = await retry.text();
      return retryText ? JSON.parse(retryText) : (undefined as T);
    } catch {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Sessão expirada");
    } finally {
      isRefreshing = false;
    }
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new ApiError(
      payload || { message: response.statusText },
      response.status,
    );
  }
  return payload as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{
      user: { id: string; email?: string; full_name?: string; roles: string[] };
      roles: string[];
      access_token: string;
      refresh_token: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (full_name: string, email: string, password: string) =>
    apiRequest<{
      user: { id: string; email?: string; full_name?: string; roles: string[] };
      roles: string[];
      access_token: string;
      refresh_token: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name, email, password }),
    }),
  me: () =>
    apiRequest<{
      id: string;
      email?: string;
      full_name?: string;
      roles: string[];
    }>("/auth/me"),
  logout: () =>
    apiRequest<{ message: string }>("/auth/logout", { method: "POST" }),
};
