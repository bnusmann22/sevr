import { http, HttpResponse } from "msw";
import type { Project, SevrFile, ExportDecision, AuditEntry, UserProfile, ProjectInvitation } from "../types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export interface StoredUser extends UserProfile {
  password?: string;
}

const SEED_USERS: StoredUser[] = [
  {
    id: "admin_001",
    email: "admin@bayero.edu.ng",
    password: "SeVRdemo2026!",
    role: "system_admin",
    name: "System Administrator",
    title: "Prof",
    edu_status: "PI",
    department: "Center for Information Technology",
    faculty: "Computer Science & IT",
    profile_completed: true,
    created_at: "2026-06-01T08:00:00Z",
  },
  {
    id: "user_001",
    email: "researcher@bayero.edu.ng",
    password: "SeVRdemo2026!",
    role: "supervisor",
    name: "Dr. Ada Okafor",
    title: "Dr",
    edu_status: "Staff",
    department: "Environmental Sciences",
    faculty: "Faculty of Earth and Environmental Sciences",
    profile_completed: true,
    created_at: "2026-06-01T09:00:00Z",
  },
  {
    id: "user_002",
    email: "jamil@bayero.edu.ng",
    password: "SeVRdemo2026!",
    role: "researcher",
    name: "Jamil Yusuf",
    title: "Mr",
    edu_status: "Student",
    student_cadre: "Postgraduate",
    student_level: "MSc",
    department: "Environmental Sciences",
    faculty: "Faculty of Earth and Environmental Sciences",
    profile_completed: true,
    created_at: "2026-06-02T10:00:00Z",
  },
  {
    id: "user_003",
    email: "bello@bayero.edu.ng",
    password: "SeVRdemo2026!",
    role: "researcher",
    name: "Bello Aminu",
    title: "Mr",
    edu_status: "Staff",
    department: "Genomics & Bioinformatics",
    faculty: "Faculty of Science",
    profile_completed: true,
    created_at: "2026-06-03T11:00:00Z",
  },
];

const SEED_INVITATIONS: ProjectInvitation[] = [];

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
    ownerId: "user_001",
    memberCount: 2,
    defaultTlp: "AMBER",
    createdAt: "2026-06-01T09:00:00Z",
  },
  {
    id: "proj_2",
    name: "Sub-Saharan Genomic Surveillance",
    description: "Pathogen genomic sequencing and antimicrobial resistance monitoring datasets.",
    ownerId: "user_001",
    memberCount: 2,
    defaultTlp: "RED",
    createdAt: "2026-07-15T14:30:00Z",
  },
  {
    id: "proj_1789777593406",
    name: "Jamil Test 123",
    description: "just Jamil",
    ownerId: "user_002",
    memberCount: 1,
    defaultTlp: "GREEN",
    createdAt: "2026-09-19T00:26:33Z",
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
  proj_1789777593406: [
    { id: "member-jamil", name: "Jamil Yusuf", email: "jamil@bayero.edu.ng", role: "Supervisor", department: "Environmental Sciences", status: "active" },
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
let usersStore: StoredUser[] = loadFromStorage("sevr_mock_users", SEED_USERS);
let invitationsStore: ProjectInvitation[] = loadFromStorage("sevr_mock_invitations", SEED_INVITATIONS);
let projectsStore: Project[] = loadFromStorage("sevr_mock_projects", SEED_PROJECTS);
let filesStore: SevrFile[] = loadFromStorage("sevr_mock_files", SEED_FILES);
let membersStore = loadFromStorage("sevr_mock_members", SEED_MEMBERS);
let activityStore = loadFromStorage("sevr_mock_activity", SEED_ACTIVITY);
let notificationsStore = loadFromStorage("sevr_mock_notifications", SEED_NOTIFICATIONS);
let auditStore: AuditEntry[] = loadFromStorage("sevr_mock_audit", SEED_AUDIT);

function getRequestUserEmail(request: Request): string {
  const headerEmail = request.headers.get("X-User-Email");
  if (headerEmail) return headerEmail.trim().toLowerCase();
  if (isBrowser()) {
    try {
      const raw = window.localStorage.getItem("sevr-session") || window.sessionStorage.getItem("sevr-session");
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.email) return session.email.trim().toLowerCase();
      }
    } catch {
      // ignore
    }
  }
  return "researcher@bayero.edu.ng";
}

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
  if (tlp === "AMBER_STRICT") {
    return overrideRequested
      ? {
          outcome: "native",
          reason: "Supervisor override authorized for internal organization egress only under TLP:AMBER+STRICT.",
          tlpLabelAtDecision: tlp,
          overrideApplied: true,
        }
      : {
          outcome: "sevr_container",
          reason: "TLP:AMBER+STRICT strictly confines data to recipient organization and requires container encryption.",
          tlpLabelAtDecision: tlp,
          overrideApplied: false,
        };
  }
  if (tlp === "AMBER") {
    return overrideRequested
      ? {
          outcome: "native",
          reason: "Supervisor approved native export for this recipient and window.",
          tlpLabelAtDecision: tlp,
          overrideApplied: true,
        }
      : {
          outcome: "sevr_container",
          reason: "TLP:AMBER-labelled files require .sevr container encryption by default.",
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
  // Authentication
  http.post(`${BASE}/api/auth/login`, async ({ request }) => {
    usersStore = loadFromStorage("sevr_mock_users", SEED_USERS);
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();

    const user = usersStore.find((u) => u.email.toLowerCase() === email);
    if (!user || (user.password && user.password !== body.password && body.password !== "SeVRdemo2026!")) {
      return HttpResponse.json({ message: "Invalid institution email or password." }, { status: 401 });
    }

    return HttpResponse.json({
      session: {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        role: user.role,
        department: user.department || "Research",
        title: user.title,
        profile_completed: Boolean(user.profile_completed),
        token: `mock-session-token-${user.id}`,
        authenticatedAt: new Date().toISOString(),
      },
    });
  }),

  // SSO Authorization URL
  http.get(`${BASE}/api/auth/sso/start`, () => {
    return HttpResponse.json({
      authorizationUrl: "http://localhost:8081/realms/sevr/protocol/openid-connect/auth",
      realm: "sevr",
      clientId: "sevr-web",
    });
  }),

  // SSO Callback — mock accepts any code and returns a researcher session
  http.post(`${BASE}/api/auth/sso/callback`, async ({ request }) => {
    const body = (await request.json()) as { code?: string };
    if (!body?.code) {
      return HttpResponse.json({ message: "Missing authorization code." }, { status: 400 });
    }
    return HttpResponse.json({
      session: {
        id: "user_001",
        email: "researcher@bayero.edu.ng",
        name: "Dr. Ada Okafor",
        role: "supervisor",
        department: "Environmental Sciences",
        title: "Dr",
        profile_completed: true,
        token: `oidc-mock-token-${Date.now()}`,
        authenticatedAt: new Date().toISOString(),
      },
    });
  }),

  // Admin User Provisioning
  http.post(`${BASE}/api/admin/users`, async ({ request }) => {
    usersStore = loadFromStorage("sevr_mock_users", SEED_USERS);
    const body = (await request.json()) as { email?: string; role?: string; temporaryPassword?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return HttpResponse.json({ message: "A valid institutional email is required." }, { status: 400 });
    }

    const existing = usersStore.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      return HttpResponse.json({ message: "User is already registered in the enclave directory." }, { status: 400 });
    }

    const tempPassword = body.temporaryPassword || `SeVR-2026-${Math.random().toString(36).slice(-6)}#`;
    const newUser: StoredUser = {
      id: `user_${Date.now()}`,
      email,
      password: tempPassword,
      role: (body.role as any) || "researcher",
      name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      profile_completed: false,
      created_at: new Date().toISOString(),
      temporary_password: tempPassword,
    };

    usersStore.unshift(newUser);
    saveToStorage("sevr_mock_users", usersStore);

    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.get(`${BASE}/api/admin/users`, ({ request }) => {
    usersStore = loadFromStorage("sevr_mock_users", SEED_USERS);
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase();
    let result = usersStore;
    if (search) {
      result = result.filter(
        (u) => u.email.toLowerCase().includes(search) || (u.name && u.name.toLowerCase().includes(search))
      );
    }
    return HttpResponse.json(result);
  }),

  // Profile Management
  http.get(`${BASE}/api/users/me/profile`, ({ request }) => {
    usersStore = loadFromStorage("sevr_mock_users", SEED_USERS);
    const email = getRequestUserEmail(request);
    const user = usersStore.find((u) => u.email.toLowerCase() === email) || usersStore[1];
    return HttpResponse.json(user);
  }),

  http.put(`${BASE}/api/users/me/profile`, async ({ request }) => {
    usersStore = loadFromStorage("sevr_mock_users", SEED_USERS);
    const email = getRequestUserEmail(request);
    const body = (await request.json()) as Partial<UserProfile>;
    let user = usersStore.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      user = usersStore[1];
    }

    if (body.title !== undefined) user.title = body.title;
    if (body.name !== undefined) user.name = body.name;
    if (body.edu_status !== undefined) user.edu_status = body.edu_status;
    if (body.student_cadre !== undefined) user.student_cadre = body.student_cadre;
    if (body.student_level !== undefined) user.student_level = body.student_level;
    if (body.department !== undefined) user.department = body.department;
    if (body.faculty !== undefined) user.faculty = body.faculty;
    user.profile_completed = true;

    saveToStorage("sevr_mock_users", usersStore);

    if (isBrowser()) {
      try {
        const raw = window.localStorage.getItem("sevr-session") || window.sessionStorage.getItem("sevr-session");
        if (raw) {
          const session = JSON.parse(raw);
          if (session.email.toLowerCase() === user.email.toLowerCase()) {
            session.profile_completed = true;
            if (user.name) session.name = user.name;
            if (user.title) session.title = user.title;
            if (user.department) session.department = user.department;
            window.localStorage.setItem("sevr-session", JSON.stringify(session));
          }
        }
      } catch {}
    }

    return HttpResponse.json(user);
  }),

  // Projects list - scoped strictly to enclaves where the requester is an active member or creator
  http.get(`${BASE}/projects`, ({ request }) => {
    projectsStore = loadFromStorage("sevr_mock_projects", SEED_PROJECTS);
    membersStore = loadFromStorage("sevr_mock_members", SEED_MEMBERS);
    usersStore = loadFromStorage("sevr_mock_users", SEED_USERS);

    const userEmail = getRequestUserEmail(request);
    const currentUser = usersStore.find((u) => u.email.toLowerCase() === userEmail);

    const userProjects = projectsStore.filter((p: any) => {
      // 1. Is user an active member of this project enclave?
      const members = membersStore[p.id] || [];
      const isMember = members.some(
        (m: any) => m.email?.trim().toLowerCase() === userEmail && m.status === "active"
      );
      if (isMember) return true;

      // 2. Is user the creator/owner of this project?
      if (p.ownerEmail && p.ownerEmail.trim().toLowerCase() === userEmail) {
        return true;
      }
      if (currentUser && p.ownerId === currentUser.id) {
        return true;
      }

      // Legacy fallback for test entries created in mock session
      if (userEmail.includes("jamil") && (p.name?.toLowerCase().includes("jamil") || p.description?.toLowerCase().includes("jamil"))) {
        return true;
      }

      return false;
    });

    return HttpResponse.json(userProjects);
  }),

  // Create project - automatically attaches creator as active supervisor member
  http.post(`${BASE}/projects`, async ({ request }) => {
    projectsStore = loadFromStorage("sevr_mock_projects", SEED_PROJECTS);
    membersStore = loadFromStorage("sevr_mock_members", SEED_MEMBERS);
    usersStore = loadFromStorage("sevr_mock_users", SEED_USERS);

    const body = (await request.json()) as Partial<Project>;
    const id = `proj_${Date.now()}`;
    const userEmail = getRequestUserEmail(request);
    const currentUser = usersStore.find((u) => u.email.toLowerCase() === userEmail);
    const userName = currentUser?.name || userEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const userDept = currentUser?.department || "Research Enclave PI";

    const project: Project = {
      id,
      name: body.name?.trim() || "Untitled Project",
      description: body.description?.trim() || "Research enclave workspace.",
      ownerId: currentUser?.id || `user_${Date.now()}`,
      memberCount: 1,
      defaultTlp: body.defaultTlp ?? "AMBER",
      createdAt: new Date().toISOString(),
      ownerEmail: userEmail,
    } as any;

    projectsStore.unshift(project);
    saveToStorage("sevr_mock_projects", projectsStore);

    // Seed creator as active supervisor member
    membersStore[id] = [
      {
        id: `member-${Date.now()}`,
        name: userName,
        email: userEmail,
        role: "Supervisor",
        department: userDept,
        status: "active",
      },
    ];
    saveToStorage("sevr_mock_members", membersStore);

    // Seed initial activity
    recordActivity(id, "create", userName, `Created research enclave "${project.name}"`);

    return HttpResponse.json(project, { status: 201 });
  }),

  // Get project by ID - Enforce active membership or creator ownership
  http.get(`${BASE}/projects/:id`, ({ params, request }) => {
    projectsStore = loadFromStorage("sevr_mock_projects", SEED_PROJECTS);
    membersStore = loadFromStorage("sevr_mock_members", SEED_MEMBERS);
    usersStore = loadFromStorage("sevr_mock_users", SEED_USERS);

    const project = projectsStore.find((item) => item.id === params.id);
    if (!project) return new HttpResponse(null, { status: 404 });

    const userEmail = getRequestUserEmail(request);
    const currentUser = usersStore.find((u) => u.email.toLowerCase() === userEmail);
    const members = membersStore[project.id] || [];

    const isMember = members.some(
      (m: any) => m.email?.trim().toLowerCase() === userEmail && m.status === "active"
    );
    const isOwner =
      ((project as any).ownerEmail && (project as any).ownerEmail.trim().toLowerCase() === userEmail) ||
      (currentUser && project.ownerId === currentUser.id) ||
      (project.name?.toLowerCase().includes("jamil") && userEmail.includes("jamil"));

    if (!isMember && !isOwner) {
      return HttpResponse.json(
        { message: "Access denied: You are not an active member of this research enclave." },
        { status: 403 }
      );
    }

    return HttpResponse.json(project);
  }),

  // Update project settings
  http.patch(`${BASE}/projects/:id`, async ({ params, request }) => {
    projectsStore = loadFromStorage("sevr_mock_projects", SEED_PROJECTS);
    const project = projectsStore.find((item) => item.id === params.id);
    if (!project) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Partial<Project>;
    if (body.name !== undefined) project.name = body.name.trim();
    if (body.description !== undefined) project.description = body.description.trim();
    if (body.defaultTlp) project.defaultTlp = body.defaultTlp;
    saveToStorage("sevr_mock_projects", projectsStore);

    const userEmail = getRequestUserEmail(request);
    recordActivity(
      String(params.id),
      "settings",
      userEmail,
      `Updated enclave settings (Default TLP: ${project.defaultTlp})`
    );

    return HttpResponse.json(project);
  }),

  // Project members
  http.get(`${BASE}/projects/:id/members`, ({ params }) => {
    const projectId = String(params.id);
    membersStore = loadFromStorage("sevr_mock_members", SEED_MEMBERS);
    if (!membersStore[projectId]) {
      membersStore[projectId] = [];
      saveToStorage("sevr_mock_members", membersStore);
    }
    return HttpResponse.json(membersStore[projectId]);
  }),

  // Invite member (Direct legacy)
  http.post(`${BASE}/projects/:id/members`, async ({ params, request }) => {
    const projectId = String(params.id);
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return HttpResponse.json({ message: "A valid email is required." }, { status: 400 });
    }
    usersStore = loadFromStorage("sevr_mock_users", SEED_USERS);
    const targetUser = usersStore.find((u) => u.email.toLowerCase() === email);
    if (!targetUser) {
      return HttpResponse.json(
        { detail: `User ${email} was not found in the enclave registry. Please contact the System Administrator to provision their profile first.` },
        { status: 404 }
      );
    }

    if (!membersStore[projectId]) {
      membersStore[projectId] = [];
    }
    const member = {
      id: `member-${Date.now()}`,
      name: targetUser.name || email.split("@")[0].replace(".", " "),
      email: targetUser.email,
      role: "Researcher",
      department: targetUser.department || "Invited Researcher",
      status: "active" as const,
    };
    membersStore[projectId].push(member);
    saveToStorage("sevr_mock_members", membersStore);

    const project = projectsStore.find((p) => p.id === projectId);
    if (project) {
      project.memberCount = membersStore[projectId].filter((m) => m.status === "active").length;
      saveToStorage("sevr_mock_projects", projectsStore);
    }

    recordActivity(projectId, "member", defaultLogin.name, `Invited ${member.email} to enclave`);
    return HttpResponse.json(member, { status: 201 });
  }),

  // Collaborator Invitations
  http.post(`${BASE}/projects/:id/invitations`, async ({ params, request }) => {
    const projectId = String(params.id);
    usersStore = loadFromStorage("sevr_mock_users", SEED_USERS);
    invitationsStore = loadFromStorage("sevr_mock_invitations", SEED_INVITATIONS);
    projectsStore = loadFromStorage("sevr_mock_projects", SEED_PROJECTS);

    const project = projectsStore.find((p) => p.id === projectId);
    if (!project) return new HttpResponse(null, { status: 404 });

    const body = (await request.json()) as { email?: string; role?: string };
    const inviteeEmail = body.email?.trim().toLowerCase();
    if (!inviteeEmail || !inviteeEmail.includes("@")) {
      return HttpResponse.json({ message: "Valid email is required." }, { status: 400 });
    }

    const targetUser = usersStore.find((u) => u.email.toLowerCase() === inviteeEmail);
    if (!targetUser) {
      return HttpResponse.json(
        {
          detail: `User ${inviteeEmail} is not registered in the enclave directory. Please request the System Administrator to provision their profile first.`,
        },
        { status: 404 }
      );
    }

    const projectMembers = membersStore[projectId] || [];
    if (projectMembers.some((m) => m.email.toLowerCase() === inviteeEmail && m.status === "active")) {
      return HttpResponse.json(
        { detail: `${inviteeEmail} is already an active member of this enclave.` },
        { status: 400 }
      );
    }

    const existingInvite = invitationsStore.find(
      (inv) => inv.projectId === projectId && inv.inviteeEmail.toLowerCase() === inviteeEmail && inv.status === "pending"
    );
    if (existingInvite) {
      return HttpResponse.json(existingInvite);
    }

    const senderEmail = getRequestUserEmail(request);
    const senderUser = usersStore.find((u) => u.email.toLowerCase() === senderEmail);

    const invitation: ProjectInvitation = {
      id: `inv_${Date.now()}`,
      projectId,
      projectName: project.name,
      projectDescription: project.description,
      defaultTlp: project.defaultTlp,
      inviterId: senderUser?.id || "user_001",
      inviterName: senderUser?.name || "Dr. Ada Okafor",
      inviterEmail: senderUser?.email || "researcher@bayero.edu.ng",
      inviteeEmail: targetUser.email,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    invitationsStore.unshift(invitation);
    saveToStorage("sevr_mock_invitations", invitationsStore);

    notificationsStore.unshift({
      id: `notif_${Date.now()}`,
      title: "Enclave Collaboration Invitation",
      detail: `You were invited by ${invitation.inviterName} to collaborate on ${project.name} (TLP:${project.defaultTlp}).`,
      time: "Just now",
      read: false,
    });
    saveToStorage("sevr_mock_notifications", notificationsStore);

    recordActivity(projectId, "member", invitation.inviterName || "Supervisor", `Dispatched collaboration invitation to ${targetUser.email}`);

    return HttpResponse.json(invitation, { status: 201 });
  }),

  http.get(`${BASE}/projects/:id/invitations`, ({ params }) => {
    const projectId = String(params.id);
    invitationsStore = loadFromStorage("sevr_mock_invitations", SEED_INVITATIONS);
    const list = invitationsStore.filter((i) => i.projectId === projectId);
    return HttpResponse.json(list);
  }),

  http.get(`${BASE}/users/me/invitations/pending`, ({ request }) => {
    invitationsStore = loadFromStorage("sevr_mock_invitations", SEED_INVITATIONS);
    const email = getRequestUserEmail(request);
    const pending = invitationsStore.filter((i) => i.inviteeEmail.toLowerCase() === email && i.status === "pending");
    return HttpResponse.json(pending);
  }),

  http.post(`${BASE}/invitations/:id/accept`, ({ params, request }) => {
    const inviteId = String(params.id);
    invitationsStore = loadFromStorage("sevr_mock_invitations", SEED_INVITATIONS);
    usersStore = loadFromStorage("sevr_mock_users", SEED_USERS);
    membersStore = loadFromStorage("sevr_mock_members", SEED_MEMBERS);
    projectsStore = loadFromStorage("sevr_mock_projects", SEED_PROJECTS);

    const invitation = invitationsStore.find((i) => i.id === inviteId);
    if (!invitation) return new HttpResponse(null, { status: 404 });

    invitation.status = "accepted";
    saveToStorage("sevr_mock_invitations", invitationsStore);

    const email = getRequestUserEmail(request);
    const user = usersStore.find((u) => u.email.toLowerCase() === email) || usersStore.find((u) => u.email.toLowerCase() === invitation.inviteeEmail.toLowerCase());

    const projectId = invitation.projectId;
    if (!membersStore[projectId]) membersStore[projectId] = [];
    const existing = membersStore[projectId].find((m) => m.email.toLowerCase() === (user?.email || email).toLowerCase());
    if (existing) {
      existing.status = "active";
    } else {
      membersStore[projectId].push({
        id: `member-${Date.now()}`,
        name: user?.name || user?.email.split("@")[0].replace(".", " ") || "Collaborator",
        email: user?.email || email,
        role: "Researcher",
        department: user?.department || "Collaborator",
        status: "active",
      });
    }
    saveToStorage("sevr_mock_members", membersStore);

    const project = projectsStore.find((p) => p.id === projectId);
    if (project) {
      project.memberCount = membersStore[projectId].filter((m) => m.status === "active").length;
      saveToStorage("sevr_mock_projects", projectsStore);
    }

    recordActivity(projectId, "member", user?.name || email, "Accepted research invitation and joined the enclave");

    return HttpResponse.json({ message: "Joined Project", project_id: projectId });
  }),

  http.post(`${BASE}/invitations/:id/decline`, ({ params }) => {
    const inviteId = String(params.id);
    invitationsStore = loadFromStorage("sevr_mock_invitations", SEED_INVITATIONS);
    const invitation = invitationsStore.find((i) => i.id === inviteId);
    if (!invitation) return new HttpResponse(null, { status: 404 });
    invitation.status = "declined";
    saveToStorage("sevr_mock_invitations", invitationsStore);
    return HttpResponse.json({ message: "Declined invitation", project_id: invitation.projectId });
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

  // Update member role
  http.patch(`${BASE}/projects/:projectId/members/:memberId/role`, async ({ params, request }) => {
    const projectId = String(params.projectId);
    const memberId = String(params.memberId);
    membersStore = loadFromStorage("sevr_mock_members", SEED_MEMBERS);
    const members = membersStore[projectId];
    const member = members?.find((m) => m.id === memberId);
    if (!member) return new HttpResponse(null, { status: 404 });

    const body = (await request.json()) as { role?: string };
    if (body.role) {
      const oldRole = member.role;
      member.role = body.role;
      saveToStorage("sevr_mock_members", membersStore);
      recordActivity(projectId, "member", "Supervisor", `Updated access role for ${member.email} from ${oldRole} to ${member.role}`);
    }
    return HttpResponse.json(member);
  }),

  // Leave project
  http.post(`${BASE}/projects/:projectId/leave`, ({ params, request }) => {
    const projectId = String(params.projectId);
    const email = getRequestUserEmail(request);
    membersStore = loadFromStorage("sevr_mock_members", SEED_MEMBERS);
    projectsStore = loadFromStorage("sevr_mock_projects", SEED_PROJECTS);

    const members = membersStore[projectId];
    const member = members?.find((m) => m.email.toLowerCase() === email && m.status === "active");
    if (!member) return HttpResponse.json({ message: "You are not an active member of this enclave" }, { status: 404 });

    member.status = "revoked";
    saveToStorage("sevr_mock_members", membersStore);

    const project = projectsStore.find((p) => p.id === projectId);
    if (project) {
      project.memberCount = members.filter((m) => m.status === "active").length;
      saveToStorage("sevr_mock_projects", projectsStore);
    }

    recordActivity(projectId, "member", member.name, "Voluntarily left the research enclave");
    return HttpResponse.json({ message: "Left project successfully" });
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
    let fileText = "";
    try {
      fileText = await file.text();
    } catch {
      fileText = `[File Content for ${file.name}]`;
    }
    const contentsStore = loadFromStorage<Record<string, string>>("sevr_mock_file_contents", {});
    contentsStore[created.id] = fileText;
    saveToStorage("sevr_mock_file_contents", contentsStore);

    filesStore.unshift(created);
    saveToStorage("sevr_mock_files", filesStore);

    recordActivity(projectId, "upload", defaultLogin.name, `Uploaded asset "${created.name}" (TLP:${created.tlpLabel})`);

    return HttpResponse.json(created, { status: 201 });
  }),

  // File versions list & upload
  http.get(`${BASE}/projects/:projectId/files/:fileId/versions`, ({ params }) => {
    const fileId = String(params.fileId);
    const versionsStore = loadFromStorage<Record<string, any[]>>("sevr_mock_versions", {});
    if (!versionsStore[fileId]) {
      versionsStore[fileId] = [
        {
          id: `ver_1`,
          fileId,
          versionNumber: "1.0",
          checksumSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          sizeBytes: 1048576,
          createdBy: "Dr. Ada Okafor",
          changeSummary: "Initial manuscript upload into research enclave",
          createdAt: new Date().toISOString(),
        },
      ];
      saveToStorage("sevr_mock_versions", versionsStore);
    }
    return HttpResponse.json(versionsStore[fileId]);
  }),

  http.post(`${BASE}/projects/:projectId/files/:fileId/versions`, async ({ params, request }) => {
    const projectId = String(params.projectId);
    const fileId = String(params.fileId);
    const body = await request.formData();
    const changeSummary = (body.get("changeSummary") as string) || "Ingested revised version";
    const uploadedFile = body.get("file");
    const file = filesStore.find((f) => f.id === fileId);

    let newText = "";
    let size = 1548576;
    if (uploadedFile instanceof File) {
      try {
        newText = await uploadedFile.text();
        size = uploadedFile.size;
      } catch { /* ignore */ }
    }

    if (newText) {
      const contentsStore = loadFromStorage<Record<string, string>>("sevr_mock_file_contents", {});
      contentsStore[fileId] = newText;
      saveToStorage("sevr_mock_file_contents", contentsStore);
    }

    const versionsStore = loadFromStorage<Record<string, any[]>>("sevr_mock_versions", {});
    const existing = versionsStore[fileId] || [];
    const nextVerNum = `${existing.length + 1}.0`;

    const newVersion = {
      id: `ver_${Date.now()}`,
      fileId,
      versionNumber: nextVerNum,
      checksumSha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      sizeBytes: size,
      createdBy: defaultLogin.name,
      changeSummary,
      createdAt: new Date().toISOString(),
    };

    if (!versionsStore[fileId]) versionsStore[fileId] = [];
    versionsStore[fileId].unshift(newVersion);
    saveToStorage("sevr_mock_versions", versionsStore);

    if (file) {
      file.versionCount = (file.versionCount || 1) + 1;
      file.sizeBytes = size;
      file.checksumSha256 = newVersion.checksumSha256;
      saveToStorage("sevr_mock_files", filesStore);
    }

    recordActivity(projectId, "upload", defaultLogin.name, `Ingested version v${nextVerNum} for asset "${file?.name ?? fileId}"`);
    return HttpResponse.json(newVersion, { status: 201 });
  }),

  // Update file content via in-enclave sandbox
  http.put(`${BASE}/projects/:projectId/files/:fileId/content`, async ({ params, request }) => {
    const projectId = String(params.projectId);
    const fileId = String(params.fileId);
    const body = (await request.json()) as { content?: string; changeSummary?: string };
    const newContent = body.content || "";
    const changeSummary = body.changeSummary || "Updated content via in-enclave editor sandbox";

    const contentsStore = loadFromStorage<Record<string, string>>("sevr_mock_file_contents", {});
    contentsStore[fileId] = newContent;
    saveToStorage("sevr_mock_file_contents", contentsStore);

    const file = filesStore.find((f) => f.id === fileId);
    const versionsStore = loadFromStorage<Record<string, any[]>>("sevr_mock_versions", {});
    const existing = versionsStore[fileId] || [];
    const nextVerNum = `${existing.length + 1}.0`;

    const newVersion = {
      id: `ver_${Date.now()}`,
      fileId,
      versionNumber: nextVerNum,
      checksumSha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      sizeBytes: new Blob([newContent]).size,
      createdBy: defaultLogin.name,
      changeSummary,
      createdAt: new Date().toISOString(),
    };

    if (!versionsStore[fileId]) versionsStore[fileId] = [];
    versionsStore[fileId].unshift(newVersion);
    saveToStorage("sevr_mock_versions", versionsStore);

    if (file) {
      file.versionCount = (file.versionCount || 1) + 1;
      file.sizeBytes = newVersion.sizeBytes;
      file.checksumSha256 = newVersion.checksumSha256;
      saveToStorage("sevr_mock_files", filesStore);
    }

    recordActivity(projectId, "upload", defaultLogin.name, `Committed version v${nextVerNum} for asset "${file?.name ?? fileId}"`);
    return HttpResponse.json(file);
  }),

  // Get file content stream for editor & preview
  http.get(`${BASE}/projects/:projectId/files/:fileId/content`, ({ params }) => {
    const fileId = String(params.fileId);
    const contentsStore = loadFromStorage<Record<string, string>>("sevr_mock_file_contents", {});
    const file = filesStore.find((f) => f.id === fileId);

    if (contentsStore[fileId]) {
      return HttpResponse.json({
        content: contentsStore[fileId],
        name: file?.name ?? fileId,
        format: file?.originalFormat ?? "docx",
      });
    }

    const defaultText = `Executive Summary: SWE Week 2025\n\nTo: Head, Department of Software Engineering\nFrom: Local Organizing Committee (L.O.C)\nDate: September 2025\n\nOverview of the project:\nSWE Week 2025 is a week-long celebration of innovation, technical growth, and student excellence within the Faculty of Computing, Bayero University Kano. Anchored by two flagship competitions—Py-Kathon 2.0 and Javineer—this initiative charts a developmental journey from foundational programming to professional-grade engineering.`;

    return HttpResponse.json({
      content: defaultText,
      name: file?.name ?? fileId,
      format: file?.originalFormat ?? "docx",
    });
  }),

  // Review notes list & post
  http.get(`${BASE}/projects/:projectId/files/:fileId/notes`, ({ params }) => {
    const fileId = String(params.fileId);
    const notesStore = loadFromStorage<Record<string, any[]>>("sevr_mock_notes", {});
    if (!notesStore[fileId]) {
      notesStore[fileId] = [
        {
          id: `note_1`,
          fileId,
          authorId: "user_001",
          authorName: "Dr. Ada Okafor",
          noteType: "SUPERVISOR_JUSTIFICATION",
          content: "Enclave asset verified under TLP:AMBER governance rules.",
          createdAt: new Date().toISOString(),
        },
      ];
      saveToStorage("sevr_mock_notes", notesStore);
    }
    return HttpResponse.json(notesStore[fileId]);
  }),

  http.post(`${BASE}/projects/:projectId/files/:fileId/notes`, async ({ params, request }) => {
    const projectId = String(params.projectId);
    const fileId = String(params.fileId);
    const body = (await request.json()) as any;

    const notesStore = loadFromStorage<Record<string, any[]>>("sevr_mock_notes", {});
    const newNote = {
      id: `note_${Date.now()}`,
      fileId,
      versionId: body.versionId,
      authorId: defaultLogin.email,
      authorName: defaultLogin.name,
      noteType: body.noteType ?? "PEER_COMMENT",
      content: body.content,
      createdAt: new Date().toISOString(),
    };

    if (!notesStore[fileId]) notesStore[fileId] = [];
    notesStore[fileId].unshift(newNote);
    saveToStorage("sevr_mock_notes", notesStore);

    recordActivity(projectId, "view", defaultLogin.name, `Posted ${body.noteType ?? "review note"} on asset`);
    return HttpResponse.json(newNote, { status: 201 });
  }),

  // State transition handler
  http.post(`${BASE}/projects/:projectId/files/:fileId/transition`, async ({ params, request }) => {
    const projectId = String(params.projectId);
    const fileId = String(params.fileId);
    const body = (await request.json()) as any;
    const file = filesStore.find((f) => f.id === fileId);

    const fromState = file?.lifecycleState ?? "DRAFT";
    const toState = body.toState;

    if (file) {
      file.lifecycleState = toState;
      saveToStorage("sevr_mock_files", filesStore);
    }

    const transition = {
      id: `trans_${Date.now()}`,
      fileId,
      fromState,
      toState,
      actorId: defaultLogin.email,
      reasonNote: body.reasonNote,
      createdAt: new Date().toISOString(),
    };

    recordActivity(projectId, "settings", defaultLogin.name, `Advanced asset state from ${fromState} to ${toState}`);
    return HttpResponse.json(transition, { status: 200 });
  }),

  // File raw text content
  http.get(`${BASE}/projects/:projectId/files/:fileId/content`, ({ params }) => {
    const fileId = String(params.fileId);
    filesStore = loadFromStorage("sevr_mock_files", SEED_FILES);
    const file = filesStore.find((f) => f.id === fileId);
    const contentsStore = loadFromStorage<Record<string, string>>("sevr_mock_file_contents", {});
    let content = contentsStore[fileId];
    if (!content && file) {
      content = `PRIMARY RESEARCH DATASET — ${file.name}\n========================================\n` +
        `Enclave File ID: ${file.id}\n` +
        `Uploaded By: ${file.uploadedBy}\n` +
        `Checksum SHA-256: ${file.checksumSha256 || "Verified"}\n` +
        `TLP Classification: TLP:${file.tlpLabel}\n\n` +
        `1. EXECUTIVE RESEARCH SUMMARY\n` +
        `This research document represents primary empirical telemetry ingested into the varsity enclave.\n` +
        `Longitudinal sampling was conducted across primary research sites in accordance with institutional zero-trust guidelines.`;
    }
    return HttpResponse.json({ content: content || "Empty Document", fileId });
  }),


  // Export decision engine
  http.post(`${BASE}/files/:id/export`, async ({ params, request }) => {
    const body = (await request.json()) as { overrideRequested?: boolean };
    const file = filesStore.find((f) => f.id === params.id);
    if (!file) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(decideExport(file.tlpLabel, Boolean(body?.overrideRequested)));
  }),

  // Audit log - scoped strictly to active enclave members
  http.get(`${BASE}/projects/:id/audit`, ({ params, request }) => {
    projectsStore = loadFromStorage("sevr_mock_projects", SEED_PROJECTS);
    membersStore = loadFromStorage("sevr_mock_members", SEED_MEMBERS);
    usersStore = loadFromStorage("sevr_mock_users", SEED_USERS);
    auditStore = loadFromStorage("sevr_mock_audit", SEED_AUDIT);

    const projectId = String(params.id);
    const userEmail = getRequestUserEmail(request);
    const currentUser = usersStore.find((u) => u.email.toLowerCase() === userEmail);
    const members = membersStore[projectId] || [];

    const isMember = members.some(
      (m: any) => m.email?.trim().toLowerCase() === userEmail && m.status === "active"
    );
    const project = projectsStore.find((p) => p.id === projectId);
    const isOwner =
      project &&
      (((project as any).ownerEmail && (project as any).ownerEmail.trim().toLowerCase() === userEmail) ||
        (currentUser && project.ownerId === currentUser.id) ||
        (project.name?.toLowerCase().includes("jamil") && userEmail.includes("jamil")));

    if (!isMember && !isOwner) {
      return HttpResponse.json(
        { message: "Access denied: You are not an active member of this enclave." },
        { status: 403 }
      );
    }

    const projectAudit = auditStore.filter((a: any) => !a.projectId || a.projectId === projectId);
    return HttpResponse.json(projectAudit);
  }),

  // ---------------------------------------------------------------------------
  // Share Tokens MSW Handlers (Phase 4)
  // ---------------------------------------------------------------------------
  http.post(`${BASE}/share/create`, async ({ request }) => {
    const body = (await request.json()) as {
      fileId: string;
      projectId: string;
      recipientEmail: string;
      artifactType?: string;
      expiresInHours?: number;
    };

    if (!body.recipientEmail || !/^[^\s@]+@(?:[a-z0-9-]+\.)*(?:edu\.ng|edu)$/i.test(body.recipientEmail)) {
      return HttpResponse.json(
        { detail: "Recipient email must belong to a valid tertiary institution domain (*.edu.ng, *.edu)" },
        { status: 400 }
      );
    }

    filesStore = loadFromStorage("sevr_mock_files", SEED_FILES);
    const file = filesStore.find((f) => f.id === body.fileId) || filesStore[0];

    const tokenStr = `st_mock_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    const expiresDt = new Date(Date.now() + (body.expiresInHours || 24) * 3600 * 1000).toISOString();

    const shareTokensStore = loadFromStorage<Record<string, any>>("sevr_mock_share_tokens", {});
    shareTokensStore[tokenStr] = {
      id: `token_${Date.now()}`,
      token: tokenStr,
      fileId: file.id,
      fileName: file.name,
      originalFormat: file.originalFormat,
      tlpLabel: file.tlpLabel,
      projectId: body.projectId,
      recipientEmail: body.recipientEmail,
      artifactType: body.artifactType || "native",
      expiresAt: expiresDt,
      status: "active",
    };
    saveToStorage("sevr_mock_share_tokens", shareTokensStore);

    return HttpResponse.json({
      id: shareTokensStore[tokenStr].id,
      token: tokenStr,
      shareUrl: `/share/${tokenStr}`,
      fileId: file.id,
      projectId: body.projectId,
      recipientEmail: body.recipientEmail,
      artifactType: body.artifactType || "native",
      expiresAt: expiresDt,
      status: "active",
    });
  }),

  http.get(`${BASE}/share/:token/validate`, ({ params }) => {
    const tokenStr = String(params.token);
    const shareTokensStore = loadFromStorage<Record<string, any>>("sevr_mock_share_tokens", {});
    const st = shareTokensStore[tokenStr];

    if (!st || st.status === "revoked") {
      return HttpResponse.json({ valid: false, status: "invalid" });
    }

    if (new Date(st.expiresAt) < new Date() || st.status === "expired") {
      return HttpResponse.json({ valid: false, status: "expired" });
    }

    return HttpResponse.json({
      valid: true,
      status: "active",
      fileId: st.fileId,
      fileName: st.fileName,
      originalFormat: st.originalFormat,
      tlpLabel: st.tlpLabel,
      recipientEmail: st.recipientEmail,
      artifactType: st.artifactType,
      expiresAt: st.expiresAt,
    });
  }),

  http.get(`${BASE}/share/:token/download`, ({ params }) => {
    const tokenStr = String(params.token);
    const shareTokensStore = loadFromStorage<Record<string, any>>("sevr_mock_share_tokens", {});
    const st = shareTokensStore[tokenStr];

    if (!st || st.status === "revoked") {
      return HttpResponse.json({ detail: "Share token unavailable" }, { status: 404 });
    }

    if (new Date(st.expiresAt) < new Date() || st.status === "expired") {
      return HttpResponse.json({ detail: "Share token has expired" }, { status: 410 });
    }

    const payloadText = `CONFIDENTIAL RESEARCH DATASET PAYLOAD for ${st.fileName || "asset"}\nIssued to: ${st.recipientEmail}`;
    const blob = new Blob([payloadText], { type: "application/octet-stream" });

    const filename = st.artifactType === "sevr_container" ? `${st.fileName}.sevr` : st.fileName;

    return new HttpResponse(blob, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }),

  // Detection Anomalies Queue Handlers
  http.get(`${BASE}/detection/anomalies`, () => {
    let anomalies = loadFromStorage<any[]>("sevr_mock_anomalies", []);
    if (!anomalies || anomalies.length === 0) {
      anomalies = [
        {
          id: "alert_1",
          projectId: "proj_1",
          detectorName: "Anomalous Bulk Download",
          targetUser: "researcher_guest",
          riskScore: 88,
          evidenceSummary: "User attempted to download 45 RED/AMBER classified datasets in under 2 minutes across multiple subnets.",
          status: "open",
          createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        },
        {
          id: "alert_2",
          projectId: "proj_1",
          detectorName: "TLP Override Mismatch",
          targetUser: "external_collab_02",
          riskScore: 74,
          evidenceSummary: "Export request initiated without mandatory PI approval header for AMBER asset.",
          status: "open",
          createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        },
      ];
      saveToStorage("sevr_mock_anomalies", anomalies);
    }
    return HttpResponse.json(anomalies);
  }),

  http.post(`${BASE}/detection/anomalies/:id/review`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as { status: string };
    const anomalies = loadFromStorage<any[]>("sevr_mock_anomalies", []);
    const index = anomalies.findIndex((a) => a.id === id);
    if (index !== -1) {
      anomalies[index].status = body.status;
      saveToStorage("sevr_mock_anomalies", anomalies);
      return HttpResponse.json(anomalies[index]);
    }
    return HttpResponse.json({ detail: "Alert not found" }, { status: 404 });
  }),
];

