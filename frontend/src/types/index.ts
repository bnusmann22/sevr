// These types are the contract between frontend and backend.
// Keep this file in sync with whatever OpenAPI schema the FastAPI
// backend eventually publishes. Until then, this file IS the contract —
// Aroyehun should build the API to match these shapes.

export type TLPLabel = "WHITE" | "GREEN" | "AMBER" | "RED";

export type Role = "researcher" | "supervisor" | "external_collaborator" | "institution_admin";

export interface Project {
  id: string;
  name: string;
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
  versionCount: number;
}

export interface ExportRequest {
  fileId: string;
  requestedBy: string;
  destination: "download" | "external_share";
  recipientEmail?: string;
}

export interface ExportDecision {
  outcome: "native" | "sevr_container";
  reason: string; // plain-language explanation shown to the requester
  tlpLabelAtDecision: TLPLabel;
  overrideApplied: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: "upload" | "view" | "edit" | "export" | "share" | "access_revoked" | "alert";
  fileId?: string;
  detail: string;
}
