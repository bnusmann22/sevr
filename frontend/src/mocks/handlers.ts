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
  { id: "proj_1", name: "Rural Groundwater Contamination Study", description: "Field research and contamination analysis across rural sampling sites.", ownerId: "user_1", memberCount: 4, defaultTlp: "AMBER", createdAt: "2026-06-01T09:00:00Z" },
];

const files: SevrFile[] = [
  { id: "file_1", projectId: "proj_1", name: "draft_manuscript_v3.docx", originalFormat: "docx", tlpLabel: "AMBER", uploadedBy: "Jamil", uploadedAt: "2026-08-01T10:00:00Z", versionCount: 3 },
  { id: "file_2", projectId: "proj_1", name: "raw_samples_2026.csv", originalFormat: "csv", tlpLabel: "RED", uploadedBy: "Jamil", uploadedAt: "2026-07-15T10:00:00Z", versionCount: 1 },
];

const auditLog: AuditEntry[] = [
  { id: "audit_1", timestamp: "2026-08-01T10:00:00Z", actor: "Jamil", action: "upload", fileId: "file_1", detail: "Uploaded draft_manuscript_v3.docx" },
];

const membersByProject = {
  proj_1: [
    { id: "member-1", name: "Dr. Ada Okafor", email: "researcher@bayero.edu.ng", role: "Supervisor", department: "Environmental Sciences", status: "active" },
    { id: "member-2", name: "Jamil Yusuf", email: "jamil@bayero.edu.ng", role: "Researcher", department: "Environmental Sciences", status: "active" },
  ],
};

const activityByProject = {
  proj_1: [
    { id: "activity-1", type: "upload", actor: "Jamil", detail: "Uploaded draft_manuscript_v3.docx", time: "Aug 1, 2026" },
    { id: "activity-2", type: "view", actor: "Dr. Ada Okafor", detail: "Viewed the project workspace", time: "Jul 31, 2026" },
    { id: "activity-3", type: "share", actor: "Jamil", detail: "Shared a review link", time: "Jul 30, 2026" },
  ],
};

const notifications = [
  { id: "n1", title: "Review requested", detail: "A native export needs supervisor review.", time: "12 min ago", read: false },
  { id: "n2", title: "Detection queue updated", detail: "One new anomaly is ready for review.", time: "1 hr ago", read: false },
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

  http.post(`${BASE}/projects`, async ({ request }) => {
    const body = (await request.json()) as Partial<Project>;
    const project: Project = {
      id: `proj_${projects.length + 1}`,
      name: body.name?.trim() || "Untitled project",
      description: body.description?.trim(),
      ownerId: "user_1",
      memberCount: 1,
      defaultTlp: body.defaultTlp ?? "AMBER",
      createdAt: new Date().toISOString(),
    };
    projects.push(project);
    return HttpResponse.json(project, { status: 201 });
  }),

  http.get(`${BASE}/projects/:id`, ({ params }) => {
    const project = projects.find((item) => item.id === params.id);
    return project ? HttpResponse.json(project) : new HttpResponse(null, { status: 404 });
  }),

  http.patch(`${BASE}/projects/:id`, async ({ params, request }) => {
    const project = projects.find((item) => item.id === params.id);
    if (!project) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Partial<Project>;
    Object.assign(project, { name: body.name?.trim() || project.name, description: body.description?.trim(), defaultTlp: body.defaultTlp ?? project.defaultTlp });
    return HttpResponse.json(project);
  }),

  http.get(`${BASE}/projects/:id/members`, ({ params }) => HttpResponse.json(membersByProject[params.id as keyof typeof membersByProject] ?? [])),

  http.post(`${BASE}/projects/:id/members`, async ({ params, request }) => {
    const body = (await request.json()) as { email?: string };
    const members = membersByProject[params.id as keyof typeof membersByProject];
    if (!members || !body.email) return HttpResponse.json({ message: "Member invitation could not be prepared." }, { status: 400 });
    const member = { id: `member-${members.length + 1}`, name: body.email.split("@")[0], email: body.email, role: "Researcher", department: "Pending invitation", status: "active" as const };
    members.push(member);
    return HttpResponse.json(member, { status: 201 });
  }),

  http.post(`${BASE}/projects/:projectId/members/:memberId/revoke`, ({ params }) => {
    const members = membersByProject[params.projectId as keyof typeof membersByProject];
    const member = members?.find((item) => item.id === params.memberId);
    if (!member) return new HttpResponse(null, { status: 404 });
    member.status = "revoked";
    return HttpResponse.json(member);
  }),

  http.get(`${BASE}/projects/:id/activity`, ({ params }) => HttpResponse.json(activityByProject[params.id as keyof typeof activityByProject] ?? [])),

  http.get(`${BASE}/notifications`, () => HttpResponse.json(notifications)),

  http.post(`${BASE}/notifications/:id/read`, ({ params }) => {
    const notification = notifications.find((item) => item.id === params.id);
    if (!notification) return new HttpResponse(null, { status: 404 });
    notification.read = true;
    return HttpResponse.json(notification);
  }),

  http.get(`${BASE}/projects/:projectId/files/:fileId`, ({ params }) => {
    const file = files.find((item) => item.projectId === params.projectId && item.id === params.fileId);
    return file ? HttpResponse.json(file) : new HttpResponse(null, { status: 404 });
  }),

  http.get(`${BASE}/projects/:id/files`, ({ params }) =>
    HttpResponse.json(files.filter((f) => f.projectId === params.id))
  ),

  http.post(`${BASE}/projects/:projectId/files`, async ({ params, request }) => {
    const body = await request.formData();
    const source = body.get("file");
    const file = source instanceof File ? source : null;
    if (!file) return HttpResponse.json({ message: "A file is required." }, { status: 400 });
    const created: SevrFile = {
      id: `file_${files.length + 1}`,
      projectId: String(params.projectId),
      name: file.name,
      originalFormat: file.name.split(".").pop() ?? "unknown",
      tlpLabel: (body.get("tlpLabel") as SevrFile["tlpLabel"]) ?? "AMBER",
      uploadedBy: "Current researcher",
      uploadedAt: new Date().toISOString(),
      sizeBytes: file.size,
      versionCount: 1,
    };
    files.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post(`${BASE}/files/:id/export`, async ({ params, request }) => {
    const body = (await request.json()) as { overrideRequested?: boolean };
    const file = files.find((f) => f.id === params.id);
    if (!file) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(decideExport(file.tlpLabel, Boolean(body?.overrideRequested)));
  }),

  http.get(`${BASE}/projects/:id/audit`, () => HttpResponse.json(auditLog)),
];
