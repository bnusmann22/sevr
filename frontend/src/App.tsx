import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Shell from "./components/layout/Shell";
import LoadingPage from "./components/layout/LoadingPage";

// Dynamic Code Splitting for heavy 3D WebGL Track A Showcase pages
const ShowcaseOverviewPage = lazy(() => import("./pages/showcase/ShowcaseOverviewPage"));
const ShowcaseSecurityPage = lazy(() => import("./pages/showcase/ShowcaseSecurityPage"));
const ShowcaseWorkflowsPage = lazy(() => import("./pages/showcase/ShowcaseWorkflowsPage"));
const ShowcaseSevrPage = lazy(() => import("./pages/showcase/ShowcaseSevrPage"));
const ShowcaseAboutPage = lazy(() => import("./pages/showcase/ShowcaseAboutPage"));
const ShowcaseDocsPage = lazy(() => import("./pages/showcase/ShowcaseDocsPage"));

import LoginPage, { isAuthenticated } from "./pages/LoginPage";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import UploadPage from "./pages/UploadPage";
import ExportSharePage from "./pages/ExportSharePage";
import AuditTrailPage from "./pages/AuditTrailPage";
import DetectionAlertsPage from "./pages/DetectionAlertsPage";
import ProjectListPage from "./pages/ProjectListPage";
import ExternalCollaboratorPage from "./pages/ExternalCollaboratorPage";
import ShareStatePage from "./pages/ShareStatePage";
import AuthStatusPage from "./pages/AuthStatusPage";

import FileDetailPage from "./pages/FileDetailPage";
import FilePreviewPage from "./pages/FilePreviewPage";
import ReleaseReviewPage from "./pages/ReleaseReviewPage";
import EnclaveEditorSandboxPage from "./pages/EnclaveEditorSandboxPage";
import AdminUsersPage from "./pages/AdminUsersPage";

function AppLoadingBoundary() {
  const [pendingRequests, setPendingRequests] = useState(0);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const startRequest = () => setPendingRequests((count) => count + 1);
    const endRequest = () => setPendingRequests((count) => Math.max(0, count - 1));
    const startAuthTransition = () => {
      setAuthLoading(true);
      window.setTimeout(() => setAuthLoading(false), 2500);
    };

    window.addEventListener("sevr:request-start", startRequest);
    window.addEventListener("sevr:request-end", endRequest);
    window.addEventListener("sevr:auth-success", startAuthTransition);
    return () => {
      window.removeEventListener("sevr:request-start", startRequest);
      window.removeEventListener("sevr:request-end", endRequest);
      window.removeEventListener("sevr:auth-success", startAuthTransition);
    };
  }, []);

  const isLoading = authLoading || pendingRequests > 0;

  return (
    <>
      <Suspense fallback={<div className="fixed inset-0 z-[100]"><LoadingPage /></div>}>
        <Routes>
          {/* Track A: Public Showcase Website & Educational Portal */}
          <Route path="/" element={<ShowcaseOverviewPage />} />
          <Route path="/landing" element={<ShowcaseOverviewPage />} />
          <Route path="/security" element={<ShowcaseSecurityPage />} />
          <Route path="/landing/security" element={<ShowcaseSecurityPage />} />
          <Route path="/workflows" element={<ShowcaseWorkflowsPage />} />
          <Route path="/landing/workflows" element={<ShowcaseWorkflowsPage />} />
          <Route path="/sevr" element={<ShowcaseSevrPage />} />
          <Route path="/landing/sevr" element={<ShowcaseSevrPage />} />
          <Route path="/about" element={<ShowcaseAboutPage />} />
          <Route path="/landing/about" element={<ShowcaseAboutPage />} />
          <Route path="/docs" element={<ShowcaseDocsPage />} />
          <Route path="/landing/docs" element={<ShowcaseDocsPage />} />
          <Route path="/privacy" element={<ShowcaseDocsPage />} />
          <Route path="/terms" element={<ShowcaseDocsPage />} />

          {/* Auth Gateway Boundary */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthStatusPage mode="callback" />} />
          <Route path="/auth/session-expired" element={<AuthStatusPage mode="expired" />} />
          <Route path="/share/:token" element={<ExternalCollaboratorPage />} />
          <Route path="/share/:token/expired" element={<ShareStatePage type="expired" />} />
          <Route path="/share/:token/invalid" element={<ShareStatePage type="invalid" />} />


          {/* Track B: Core Operational Platform (Authenticated Enclave Shell) */}
          <Route path="/*" element={<ProtectedApp />} />
        </Routes>
      </Suspense>
      {isLoading && <div className="fixed inset-0 z-[100]"><LoadingPage /></div>}
    </>
  );
}

function ProtectedApp() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return (
    <Shell>
      <Routes>
        <Route path="/home" element={<ProjectListPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/app/projects" element={<ProjectWorkspace />} />
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/projects/:projectId" element={<ProjectWorkspace />} />
        <Route path="/projects/:projectId/files/:fileId" element={<FileDetailPage />} />
        <Route path="/projects/:projectId/files/:fileId/edit" element={<EnclaveEditorSandboxPage />} />
        <Route path="/projects/:projectId/files/:fileId/preview" element={<FilePreviewPage />} />
        <Route path="/projects/:projectId/files/:fileId/release" element={<ReleaseReviewPage />} />
        <Route path="/projects/:projectId/upload" element={<UploadPage />} />
        <Route path="/projects/:projectId/export" element={<ExportSharePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/export" element={<ExportSharePage />} />
        <Route path="/audit" element={<AuditTrailPage />} />
        <Route path="/app/audit" element={<AuditTrailPage />} />
        <Route path="/alerts" element={<DetectionAlertsPage />} />
        <Route path="/app/alerts" element={<DetectionAlertsPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Shell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLoadingBoundary />
    </BrowserRouter>
  );
}
