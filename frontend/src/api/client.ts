import axios from "axios";

// Every screen calls through this client, never axios directly.
// When Aroyehun's real API is live, only VITE_API_BASE_URL and
// VITE_USE_MOCKS in .env need to change: no component rewrites.

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  window.dispatchEvent(new CustomEvent("sevr:request-start"));
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    window.dispatchEvent(new CustomEvent("sevr:request-end"));
    return response;
  },
  (error) => {
    window.dispatchEvent(new CustomEvent("sevr:request-end"));
    return Promise.reject(error);
  },
);

export const usingMocks = import.meta.env.VITE_USE_MOCKS === "true";
