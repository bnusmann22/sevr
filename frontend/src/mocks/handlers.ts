import { http, HttpResponse } from "msw";
import type { Project, SevrFile, ExportDecision, AuditEntry } from "../types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const defaultLogin = {
  email: "researcher@bayero.edu.ng",
  password: "SeVRdemo2026!",
  name: "Dr. Ada Okafor",
  role: "supervisor" as const,
};

const projects: Project[] = [
  { id: "proj_1", name: "Rural Groundwater Contamination Study", memberCount: 4, createdAt: "2026-06-01T09:00:00Z" },
];

const files: SevrFile[] = [
  { id: "file_1", projectId: "proj_1", name: "draft_manuscript_v3.docx", originalFormat: "docx", tlpLabel: "AMBER", uploadedBy: "Jamil", uploadedAt: "2026-08-01T10:00:00Z", versionCount: 3 },
  { id: "file_2", projectId: "proj_1", name: "raw_samples_2026.csv", originalFormat: "csv", tlpLabel: "RED", uploadedBy: "Jamil", uploadedAt: "2026-07-15T10:00:00Z", versionCount: 1 },
];

const auditLog: AuditEntry[] = [
  { id: "audit_1", timestamp: "2026-08-01T10:00:00Z", actor: "Jamil", action: "upload", fileId: "file_1", detail: "Uploaded draft_manuscript_v3.docx" },
];

// Mirrors the decision table in the PRD Section 5.1.
function decideExport(tlp: SevrFile["tlpLabel"], overrideRequested: boolean): ExportDecision {
  if (tlp === "RED") {
    return { outcome: "sevr_container", reason: "RED-labelled files are always exported as .sevr containers. This cannot be overridden.", tlpLabelAtDecision: tlp, overrideApplied: false };
  }
  if (tlp === "AMBER") {
    return overrideRequested
      ? { outcome: "native", reason: "Supervisor approved native export for this recipient and window.", tlpLabelAtDecision: tlp, overrideApplied: true }
      : { outcome: "sevr_container", reason: "AMBER-labelled files require .sevr export by default.", tlpLabelAtDecision: tlp, overrideApplied: false };
  }
  return { outcome: "native", reason: `${tlp}-labelled files export in native format by default.`, tlpLabelAtDecision: tlp, overrideApplied: false };
}

export const handlers = [
  http.post(`${BASE}/api/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();

    if (email !== defaultLogin.email || body.password !== defaultLogin.password) {
      return HttpResponse.json({ message: "Invalid institution email or password." }, { status: 401 });
    }

    return HttpResponse.json({
      session: {
        email: defaultLogin.email,
        name: defaultLogin.name,
        role: defaultLogin.role,
        department: "Environmental Sciences",
        token: "mock-session-token",
        authenticatedAt: new Date().toISOString(),
      },
    });
  }),

  http.get(`${BASE}/projects`, () => HttpResponse.json(projects)),

  http.get(`${BASE}/projects/:id/files`, ({ params }) =>
    HttpResponse.json(files.filter((f) => f.projectId === params.id))
  ),

  http.post(`${BASE}/files/:id/export`, async ({ params, request }) => {
    const body = (await request.json()) as { overrideRequested?: boolean };
    const file = files.find((f) => f.id === params.id);
    if (!file) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(decideExport(file.tlpLabel, Boolean(body?.overrideRequested)));
  }),

  http.get(`${BASE}/projects/:id/audit`, () => HttpResponse.json(auditLog)),
];
