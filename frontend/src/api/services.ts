import { apiClient } from "./client";
import type {
  Project,
  SevrFile,
  ExportDecision,
  TLPLabel,
  UserProfile,
  ProjectInvitation,
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

  async updateRole(projectId: string, memberId: string, role: string): Promise<ProjectMember> {
    const { data } = await apiClient.patch<ProjectMember>(
      `/projects/${projectId}/members/${memberId}/role`,
      { role }
    );
    return data;
  },

  async leave(projectId: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(`/projects/${projectId}/leave`);
    return data;
  },
};

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------
export const adminApi = {
  async provisionUser(payload: { email: string; role?: string; temporaryPassword?: string }): Promise<UserProfile> {
    const { data } = await apiClient.post<UserProfile>("/api/admin/users", payload);
    return data;
  },

  async listUsers(params?: { search?: string; page?: number }): Promise<UserProfile[]> {
    const { data } = await apiClient.get<UserProfile[]>("/api/admin/users", { params });
    return data;
  },

  async changeRole(userId: string, role: string): Promise<UserProfile> {
    const { data } = await apiClient.patch<UserProfile>(`/api/admin/users/${userId}/role`, { role });
    return data;
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/api/admin/users/${userId}`);
  },

  async resetCredentials(userId: string): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>(`/api/admin/users/${userId}/credentials`);
    return data;
  },
};

// ---------------------------------------------------------------------------
// Profile KYC API
// ---------------------------------------------------------------------------
export const profileApi = {
  async getProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>("/api/users/me/profile");
    return data;
  },

  async updateProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
    const { data } = await apiClient.put<UserProfile>("/api/users/me/profile", payload);
    return data;
  },
};

// ---------------------------------------------------------------------------
// Enclave Collaborator Invitations API
// ---------------------------------------------------------------------------
export const invitationsApi = {
  async create(projectId: string, payload: { email: string; role?: string }): Promise<ProjectInvitation> {
    const { data } = await apiClient.post<ProjectInvitation>(`/projects/${projectId}/invitations`, payload);
    return data;
  },

  async listForProject(projectId: string): Promise<ProjectInvitation[]> {
    const { data } = await apiClient.get<ProjectInvitation[]>(`/projects/${projectId}/invitations`);
    return data;
  },

  async listPendingForMe(): Promise<ProjectInvitation[]> {
    const { data } = await apiClient.get<ProjectInvitation[]>("/users/me/invitations/pending");
    return data;
  },

  async accept(invitationId: string): Promise<{ message: string; project_id: string }> {
    const { data } = await apiClient.post<{ message: string; project_id: string }>(`/invitations/${invitationId}/accept`);
    return data;
  },

  async decline(invitationId: string): Promise<{ message: string; project_id: string }> {
    const { data } = await apiClient.post<{ message: string; project_id: string }>(`/invitations/${invitationId}/decline`);
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
