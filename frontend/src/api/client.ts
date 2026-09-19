import axios from "axios";

// Every screen calls through this client, never axios directly.
// VITE_API_BASE_URL controls the real backend endpoint.

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Purge any legacy MSW localStorage sessions that contain mock tokens.
// These are non-persistable and will fail auth against the real backend.
(function purgeStaleSessions() {
  try {
    const stores = [window.localStorage, window.sessionStorage];
    for (const store of stores) {
      const raw = store.getItem("sevr-session");
      if (!raw) continue;
      const session = JSON.parse(raw);
      const token: string = session?.token ?? "";
      // Mock tokens written by MSW handlers — not valid against FastAPI
      if (
        token.startsWith("mock-session-token-") ||
        token.startsWith("oidc-mock-token-") ||
        token.startsWith("db-authenticated-session-token")
      ) {
        store.removeItem("sevr-session");
        console.info("[SeVR] Stale mock session purged — please log in again.");
      }
    }
  } catch {
    // Non-fatal: storage may be unavailable in certain contexts
  }
})();

apiClient.interceptors.request.use((config) => {
  window.dispatchEvent(new CustomEvent("sevr:request-start"));
  try {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem("sevr-session") ||
          window.sessionStorage.getItem("sevr-session")
        : null;
    if (raw) {
      const session = JSON.parse(raw);
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
      if (session?.email) {
        config.headers["X-User-Email"] = session.email;
      }
    }
  } catch {
    // Ignore parse error
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    window.dispatchEvent(new CustomEvent("sevr:request-end"));
    return response;
  },
  (error) => {
    window.dispatchEvent(new CustomEvent("sevr:request-end"));
    // Global 401 handler — clear session and redirect to login
    if (error?.response?.status === 401) {
      try {
        window.localStorage.removeItem("sevr-session");
        window.sessionStorage.removeItem("sevr-session");
      } catch { /* ignore */ }
      if (!window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/session-expired";
      }
    }
    return Promise.reject(error);
  },
);
