// Custom Data Fetching Hooks (TanStack Query / Fetch Wrapper)
// Under Construction - SeVR 1.0 API Layer

import { apiClient } from "./client";
import type { Project, SevrFile, AuditEntry } from "../types";

export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await apiClient.get<Project[]>("/api/projects");
    return response.data;
  } catch (err) {
    console.warn("[SeVR API] fetchProjects placeholder error fallback:", err);
    return [];
  }
}

export async function fetchFiles(projectId: string): Promise<SevrFile[]> {
  try {
    const response = await apiClient.get<SevrFile[]>(`/api/projects/${projectId}/files`);
    return response.data;
  } catch (err) {
    console.warn("[SeVR API] fetchFiles placeholder error fallback:", err);
    return [];
  }
}

export async function fetchAuditLogs(): Promise<AuditEntry[]> {
  try {
    const response = await apiClient.get<AuditEntry[]>("/api/audit");
    return response.data;
  } catch (err) {
    console.warn("[SeVR API] fetchAuditLogs placeholder error fallback:", err);
    return [];
  }
}
