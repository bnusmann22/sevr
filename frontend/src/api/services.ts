import { apiClient } from "./client";
import type {
  Project,
  SevrFile,
  ExportDecision,
  TLPLabel,
} from "../types";

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "revoked";
}

export interface ActivityEvent {
  id: string;
  type: string;
  actor: string;
  detail: string;
  time: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  defaultTlp?: TLPLabel;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  defaultTlp?: TLPLabel;
}

// ---------------------------------------------------------------------------
// Projects API
// ---------------------------------------------------------------------------
export const projectsApi = {
  async list(): Promise<Project[]> {
    const { data } = await apiClient.get<Project[]>("/projects");
    return data;
  },

  async get(id: string): Promise<Project> {
    const { data } = await apiClient.get<Project>(`/projects/${id}`);
    return data;
  },

  async create(payload: CreateProjectPayload): Promise<Project> {
    const { data } = await apiClient.post<Project>("/projects", payload);
    return data;
  },

  async update(id: string, payload: UpdateProjectPayload): Promise<Project> {
    const { data } = await apiClient.patch<Project>(`/projects/${id}`, payload);
    return data;
  },
};

// ---------------------------------------------------------------------------
// Files API
// ---------------------------------------------------------------------------
export const filesApi = {
  async list(projectId: string): Promise<SevrFile[]> {
    const { data } = await apiClient.get<SevrFile[]>(`/projects/${projectId}/files`);
    return data;
  },

  async get(projectId: string, fileId: string): Promise<SevrFile> {
    const { data } = await apiClient.get<SevrFile>(`/projects/${projectId}/files/${fileId}`);
    return data;
  },

  async upload(projectId: string, formData: FormData): Promise<SevrFile> {
    const { data } = await apiClient.post<SevrFile>(
      `/projects/${projectId}/files`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  async evaluateExport(fileId: string, overrideRequested: boolean): Promise<ExportDecision> {
    const { data } = await apiClient.post<ExportDecision>(`/files/${fileId}/export`, {
      overrideRequested,
    });
    return data;
  },
};

// ---------------------------------------------------------------------------
// Members API
// ---------------------------------------------------------------------------
export const membersApi = {
  async list(projectId: string): Promise<ProjectMember[]> {
    const { data } = await apiClient.get<ProjectMember[]>(`/projects/${projectId}/members`);
    return data;
  },

  async invite(projectId: string, email: string): Promise<ProjectMember> {
    const { data } = await apiClient.post<ProjectMember>(`/projects/${projectId}/members`, {
      email,
    });
    return data;
  },

  async revoke(projectId: string, memberId: string): Promise<ProjectMember> {
    const { data } = await apiClient.post<ProjectMember>(
      `/projects/${projectId}/members/${memberId}/revoke`
    );
    return data;
  },
};

// ---------------------------------------------------------------------------
// Activity API
// ---------------------------------------------------------------------------
export const activityApi = {
  async list(projectId: string): Promise<ActivityEvent[]> {
    const { data } = await apiClient.get<ActivityEvent[]>(`/projects/${projectId}/activity`);
    return data;
  },
};

// ---------------------------------------------------------------------------
// Notifications API
// ---------------------------------------------------------------------------
export const notificationsApi = {
  async list(): Promise<NotificationItem[]> {
    const { data } = await apiClient.get<NotificationItem[]>("/notifications");
    return data;
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const { data } = await apiClient.post<NotificationItem>(`/notifications/${id}/read`);
    return data;
  },
};
