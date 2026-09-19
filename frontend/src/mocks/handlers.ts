import { http, HttpResponse } from "msw";
import type { Project, SevrFile, ExportDecision, AuditEntry } from "../types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const defaultLogin = {
  email: "researcher@bayero.edu.ng",
  password: "SeVRdemo2026!",
  name: "Dr. Ada Okafor",
  role: "supervisor" as const,
};

// ---------------------------------------------------------------------------
// LocalStorage Persistence Helpers
// ---------------------------------------------------------------------------
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to persist ${key} to localStorage:`, err);
  }
}

// ---------------------------------------------------------------------------
// Seed Data
// ---------------------------------------------------------------------------
const SEED_PROJECTS: Project[] = [
  {
    id: "proj_1",
    name: "Rural Groundwater Contamination Study",
    description: "Field research and contamination analysis across rural sampling sites in the Chad Basin.",
    ownerId: "user_1",
    memberCount: 4,
    defaultTlp: "AMBER",
    createdAt: "2026-06-01T09:00:00Z",
  },
  {
    id: "proj_2",
    name: "Sub-Saharan Genomic Surveillance",
    description: "Pathogen genomic sequencing and antimicrobial resistance monitoring datasets.",
    ownerId: "user_1",
    memberCount: 6,
    defaultTlp: "RED",
    createdAt: "2026-07-15T14:30:00Z",
  },
];

const SEED_FILES: SevrFile[] = [
  {
    id: "file_1",
    projectId: "proj_1",
    name: "draft_manuscript_v3.docx",
    originalFormat: "docx",
    tlpLabel: "AMBER",
    uploadedBy: "Jamil Yusuf",
    uploadedAt: "2026-08-01T10:00:00Z",
    sizeBytes: 1048576,
    checksumSha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    versionCount: 3,
  },
  {
    id: "file_2",
    projectId: "proj_1",
    name: "raw_samples_2026.csv",
    originalFormat: "csv",
    tlpLabel: "RED",
    uploadedBy: "Jamil Yusuf",
    uploadedAt: "2026-07-15T10:00:00Z",
    sizeBytes: 4194304,
    checksumSha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    versionCount: 1,
  },
  {
    id: "file_3",
    projectId: "proj_2",
    name: "pathogen_isolates_seq.fasta",
    originalFormat: "fasta",
    tlpLabel: "RED",
    uploadedBy: "Dr. Ada Okafor",
    uploadedAt: "2026-08-10T11:20:00Z",
    sizeBytes: 12582912,
    checksumSha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    versionCount: 2,
  },
  {
    id: "file_4",
    projectId: "proj_2",
    name: "lab_sop_clearance.pdf",
    originalFormat: "pdf",
    tlpLabel: "GREEN",
    uploadedBy: "Dr. Ada Okafor",
    uploadedAt: "2026-08-12T08:45:00Z",
    sizeBytes: 524288,
    checksumSha256: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    versionCount: 1,
  },
];

const SEED_MEMBERS: Record<string, Array<{ id: string; name: string; email: string; role: string; department: string; status: "active" | "revoked" }>> = {
  proj_1: [
    { id: "member-1", name: "Dr. Ada Okafor", email: "researcher@bayero.edu.ng", role: "Supervisor", department: "Environmental Sciences", status: "active" },
    { id: "member-2", name: "Jamil Yusuf", email: "jamil@bayero.edu.ng", role: "Researcher", department: "Environmental Sciences", status: "active" },
  ],
  proj_2: [
    { id: "member-1", name: "Dr. Ada Okafor", email: "researcher@bayero.edu.ng", role: "Supervisor", department: "Genomics & Bioinformatics", status: "active" },
    { id: "member-3", name: "Bello Aminu", email: "bello@bayero.edu.ng", role: "Researcher", department: "Genomics & Bioinformatics", status: "active" },
  ],
};

const SEED_ACTIVITY: Record<string, Array<{ id: string; type: string; actor: string; detail: string; time: string }>> = {
  proj_1: [
    { id: "activity-1", type: "upload", actor: "Jamil Yusuf", detail: "Uploaded draft_manuscript_v3.docx", time: "Aug 1, 2026" },
    { id: "activity-2", type: "view", actor: "Dr. Ada Okafor", detail: "Viewed the project workspace", time: "Jul 31, 2026" },
    { id: "activity-3", type: "share", actor: "Jamil Yusuf", detail: "Shared a review link", time: "Jul 30, 2026" },
  ],
  proj_2: [
    { id: "activity-4", type: "upload", actor: "Dr. Ada Okafor", detail: "Ingested pathogen_isolates_seq.fasta (TLP:RED)", time: "Aug 10, 2026" },
    { id: "activity-5", type: "view", actor: "Bello Aminu", detail: "Accessed genomic sequence workspace", time: "Aug 11, 2026" },
  ],
};

const SEED_NOTIFICATIONS = [
  { id: "n1", title: "Review requested", detail: "A native export needs supervisor review.", time: "12 min ago", read: false },
  { id: "n2", title: "Detection queue updated", detail: "One new anomaly is ready for review.", time: "1 hr ago", read: false },
];

const SEED_AUDIT: AuditEntry[] = [
  { id: "audit_1", timestamp: "2026-08-01T10:00:00Z", actor: "Jamil Yusuf", action: "upload", fileId: "file_1", detail: "Uploaded draft_manuscript_v3.docx" },
  { id: "audit_2", timestamp: "2026-08-10T11:20:00Z", actor: "Dr. Ada Okafor", action: "upload", fileId: "file_3", detail: "Uploaded pathogen_isolates_seq.fasta" },
];

// Persistent stores
let projectsStore: Project[] = loadFromStorage("sevr_mock_projects", SEED_PROJECTS);
let filesStore: SevrFile[] = loadFromStorage("sevr_mock_files", SEED_FILES);
let membersStore = loadFromStorage("sevr_mock_members", SEED_MEMBERS);
let activityStore = loadFromStorage("sevr_mock_activity", SEED_ACTIVITY);
let notificationsStore = loadFromStorage("sevr_mock_notifications", SEED_NOTIFICATIONS);
let auditStore: AuditEntry[] = loadFromStorage("sevr_mock_audit", SEED_AUDIT);

// Helper to record activity
function recordActivity(projectId: string, type: string, actor: string, detail: string) {
  if (!activityStore[projectId]) {
    activityStore[projectId] = [];
  }
  activityStore[projectId].unshift({
    id: `activity-${Date.now()}`,
    type,
    actor,
    detail,
    time: "Just now",
  });
  saveToStorage("sevr_mock_activity", activityStore);
}

// PRD Section 5.1 Decision Table
function decideExport(tlp: SevrFile["tlpLabel"], overrideRequested: boolean): ExportDecision {
  if (tlp === "RED") {
    return {
      outcome: "sevr_container",
      reason: "RED-labelled files are always exported as .sevr containers. This cannot be overridden.",
      tlpLabelAtDecision: tlp,
      overrideApplied: false,
    };
  }
  if (tlp === "AMBER" || tlp === "AMBER_STRICT") {
    return overrideRequested
      ? {
          outcome: "native",
          reason: "Supervisor approved native export for this recipient and window.",
          tlpLabelAtDecision: tlp,
          overrideApplied: true,
        }
      : {
          outcome: "sevr_container",
          reason: `${tlp}-labelled files require .sevr container encryption by default.`,
          tlpLabelAtDecision: tlp,
          overrideApplied: false,
        };
  }
  return {
    outcome: "native",
    reason: `${tlp}-labelled files export in native format by default.`,
    tlpLabelAtDecision: tlp,
    overrideApplied: false,
  };
}

export const handlers = [
  // Authentication
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

  // Projects list
  http.get(`${BASE}/projects`, () => {
    return HttpResponse.json(projectsStore);
  }),

  // Create project
  http.post(`${BASE}/projects`, async ({ request }) => {
    const body = (await request.json()) as Partial<Project>;
    const id = `proj_${Date.now()}`;
    const project: Project = {
      id,
      name: body.name?.trim() || "Untitled Project",
      description: body.description?.trim() || "Research enclave workspace.",
      ownerId: "user_1",
      memberCount: 1,
      defaultTlp: body.defaultTlp ?? "AMBER",
      createdAt: new Date().toISOString(),
    };
    projectsStore.push(project);
    saveToStorage("sevr_mock_projects", projectsStore);

    // Seed default member
    membersStore[id] = [
      {
        id: `member-${Date.now()}`,
        name: defaultLogin.name,
        email: defaultLogin.email,
        role: "Supervisor",
        department: "Research Enclave PI",
        status: "active",
      },
    ];
    saveToStorage("sevr_mock_members", membersStore);

    // Seed initial activity
    recordActivity(id, "create", defaultLogin.name, `Created research enclave "${project.name}"`);

    return HttpResponse.json(project, { status: 201 });
  }),

  // Get project by ID
  http.get(`${BASE}/projects/:id`, ({ params }) => {
    const project = projectsStore.find((item) => item.id === params.id);
    return project ? HttpResponse.json(project) : new HttpResponse(null, { status: 404 });
  }),

  // Update project settings
  http.patch(`${BASE}/projects/:id`, async ({ params, request }) => {
    const project = projectsStore.find((item) => item.id === params.id);
    if (!project) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Partial<Project>;
    if (body.name) project.name = body.name.trim();
    if (body.description !== undefined) project.description = body.description.trim();
    if (body.defaultTlp) project.defaultTlp = body.defaultTlp;
    saveToStorage("sevr_mock_projects", projectsStore);

    recordActivity(
      String(params.id),
      "settings",
      defaultLogin.name,
      `Updated enclave settings (Default TLP: ${project.defaultTlp})`
    );

    return HttpResponse.json(project);
  }),

  // Project members
  http.get(`${BASE}/projects/:id/members`, ({ params }) => {
    const projectId = String(params.id);
    if (!membersStore[projectId]) {
      membersStore[projectId] = [
        {
          id: `member-${Date.now()}`,
          name: defaultLogin.name,
          email: defaultLogin.email,
          role: "Supervisor",
          department: "Enclave Member",
          status: "active",
        },
      ];
      saveToStorage("sevr_mock_members", membersStore);
    }
    return HttpResponse.json(membersStore[projectId]);
  }),

  // Invite member
  http.post(`${BASE}/projects/:id/members`, async ({ params, request }) => {
    const projectId = String(params.id);
    const body = (await request.json()) as { email?: string };
    if (!body.email || !body.email.includes("@")) {
      return HttpResponse.json({ message: "A valid email is required." }, { status: 400 });
    }
    if (!membersStore[projectId]) {
      membersStore[projectId] = [];
    }
    const member = {
      id: `member-${Date.now()}`,
      name: body.email.split("@")[0].replace(".", " "),
      email: body.email,
      role: "Researcher",
      department: "Invited Researcher",
      status: "active" as const,
    };
    membersStore[projectId].push(member);
    saveToStorage("sevr_mock_members", membersStore);

    // Update project member count
    const project = projectsStore.find((p) => p.id === projectId);
    if (project) {
      project.memberCount = membersStore[projectId].filter((m) => m.status === "active").length;
      saveToStorage("sevr_mock_projects", projectsStore);
    }

    recordActivity(projectId, "member", defaultLogin.name, `Invited ${member.email} to enclave`);
    return HttpResponse.json(member, { status: 201 });
  }),

  // Revoke member
  http.post(`${BASE}/projects/:projectId/members/:memberId/revoke`, ({ params }) => {
    const projectId = String(params.projectId);
    const members = membersStore[projectId];
    const member = members?.find((item) => item.id === params.memberId);
    if (!member) return new HttpResponse(null, { status: 404 });
    member.status = "revoked";
    saveToStorage("sevr_mock_members", membersStore);

    const project = projectsStore.find((p) => p.id === projectId);
    if (project) {
      project.memberCount = members.filter((m) => m.status === "active").length;
      saveToStorage("sevr_mock_projects", projectsStore);
    }

    recordActivity(projectId, "member", defaultLogin.name, `Revoked access for ${member.email}`);
    return HttpResponse.json(member);
  }),

  // Project activity
  http.get(`${BASE}/projects/:id/activity`, ({ params }) => {
    const projectId = String(params.id);
    if (!activityStore[projectId]) {
      activityStore[projectId] = [
        {
          id: `act-${Date.now()}`,
          type: "create",
          actor: defaultLogin.name,
          detail: "Enclave initialized with Zero-Trust protection.",
          time: "Recently",
        },
      ];
      saveToStorage("sevr_mock_activity", activityStore);
    }
    return HttpResponse.json(activityStore[projectId]);
  }),

  // Notifications
  http.get(`${BASE}/notifications`, () => HttpResponse.json(notificationsStore)),

  http.post(`${BASE}/notifications/:id/read`, ({ params }) => {
    const notification = notificationsStore.find((item) => item.id === params.id);
    if (!notification) return new HttpResponse(null, { status: 404 });
    notification.read = true;
    saveToStorage("sevr_mock_notifications", notificationsStore);
    return HttpResponse.json(notification);
  }),

  // Files for project
  http.get(`${BASE}/projects/:id/files`, ({ params }) => {
    const list = filesStore.filter((f) => f.projectId === params.id);
    return HttpResponse.json(list);
  }),

  // Specific file detail
  http.get(`${BASE}/projects/:projectId/files/:fileId`, ({ params }) => {
    const file = filesStore.find(
      (item) => item.projectId === params.projectId && item.id === params.fileId
    );
    return file ? HttpResponse.json(file) : new HttpResponse(null, { status: 404 });
  }),

  // Upload file to project
  http.post(`${BASE}/projects/:projectId/files`, async ({ params, request }) => {
    const projectId = String(params.projectId);
    const body = await request.formData();
    const source = body.get("file");
    const file = source instanceof File ? source : null;
    if (!file) return HttpResponse.json({ message: "A file is required." }, { status: 400 });

    const created: SevrFile = {
      id: `file_${Date.now()}`,
      projectId,
      name: file.name,
      originalFormat: file.name.split(".").pop() ?? "unknown",
      tlpLabel: (body.get("tlpLabel") as SevrFile["tlpLabel"]) ?? "AMBER",
      uploadedBy: defaultLogin.name,
      uploadedAt: new Date().toISOString(),
      sizeBytes: file.size,
      checksumSha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      versionCount: 1,
    };
    filesStore.unshift(created);
    saveToStorage("sevr_mock_files", filesStore);

    recordActivity(projectId, "upload", defaultLogin.name, `Uploaded asset "${created.name}" (TLP:${created.tlpLabel})`);

    return HttpResponse.json(created, { status: 201 });
  }),

  // Export decision engine
  http.post(`${BASE}/files/:id/export`, async ({ params, request }) => {
    const body = (await request.json()) as { overrideRequested?: boolean };
    const file = filesStore.find((f) => f.id === params.id);
    if (!file) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(decideExport(file.tlpLabel, Boolean(body?.overrideRequested)));
  }),

  // Audit log
  http.get(`${BASE}/projects/:id/audit`, () => HttpResponse.json(auditStore)),
];
