import axios from "axios";

// Every screen calls through this client, never axios directly.
// When Aroyehun's real API is live, only VITE_API_BASE_URL and
// VITE_USE_MOCKS in .env need to change — no component rewrites.

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

export const usingMocks = import.meta.env.VITE_USE_MOCKS === "true";
