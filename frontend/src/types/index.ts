// SeVR 1.0 Data Contracts & TypeScript Definitions
// Aligned with FIRST TLP 2.0 & OpenAPI Specifications

export type TLP20Label = "CLEAR" | "GREEN" | "AMBER" | "AMBER_STRICT" | "RED";
export type TLPLabel = TLP20Label | "WHITE"; // Backward compatibility alias

export type UserRole = "researcher" | "supervisor" | "external_collaborator" | "institution_admin";
export type Role = UserRole;

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  department: string;
  token?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId?: string;
  defaultTlp?: TLPLabel;
  memberCount: number;
  createdAt: string;
}

export interface SevrFile {
  id: string;
  projectId: string;
  name: string;
  originalFormat: string;
  tlpLabel: TLPLabel;
  uploadedBy: string;
  uploadedAt: string;
  sizeBytes?: number;
  checksumSha256?: string;
  versionCount: number;
}

export interface ExportRequest {
  fileId: string;
  requestedBy: string;
  destination: "download" | "external_share";
  recipientEmail?: string;
  overrideRequested?: boolean;
}

export interface ExportDecision {
  outcome: "native" | "sevr_container" | "blocked";
  reason: string; // plain-language explanation shown to requester
  tlpLabelAtDecision: TLPLabel;
  overrideApplied: boolean;
}

export interface ShareRecord {
  id: string;
  fileId: string;
  recipientEmail: string;
  expiresAt: string;
  token: string;
  createdBy: string;
}

export interface DetectionAlert {
  id: string;
  detectorName: string;
  targetUser: string;
  riskScore: number;
  evidenceSummary: string;
  status: "open" | "acknowledged" | "dismissed" | "escalated";
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: "upload" | "view" | "edit" | "export" | "share" | "access_revoked" | "alert";
  resource?: string;
  fileId?: string;
  detail: string;
  previousHash?: string;
  currentHash?: string;
}
