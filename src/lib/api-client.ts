/**
 * Centralized Axios instance for all BlogSpace API calls.
 *
 * - Base URL: VITE_API_URL env var (falls back to http://localhost:5000/api)
 * - Request interceptor: attaches Bearer token from localStorage (Zustand persist key)
 * - Response interceptor: unwraps the { success, data } envelope and normalises errors
 */

import axios, { type AxiosError } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT Bearer token ──────────────────────────────
apiClient.interceptors.request.use((config) => {
  // Zustand persists the auth store under "blogspace-auth" in localStorage.
  // We read it here directly so this file has no circular import on the store.
  try {
    const raw = localStorage.getItem("blogspace-auth");
    const parsed = raw ? (JSON.parse(raw) as { state?: { token?: string } }) : null;
    const token = parsed?.state?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // localStorage unavailable (SSR, private browsing) — proceed without token.
  }
  return config;
});

// ── Response interceptor: unwrap envelope & normalise errors ─────────────────
apiClient.interceptors.response.use(
  (response) => response, // Pass through; callers unwrap .data themselves.
  (error: AxiosError<{ message?: string; details?: unknown[] }>) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);
