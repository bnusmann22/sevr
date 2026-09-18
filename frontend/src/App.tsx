import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Shell from "./components/layout/Shell";
import LoadingPage from "./components/layout/LoadingPage";
import ShowcaseOverviewPage from "./pages/showcase/ShowcaseOverviewPage";
import ShowcaseSecurityPage from "./pages/showcase/ShowcaseSecurityPage";
import ShowcaseWorkflowsPage from "./pages/showcase/ShowcaseWorkflowsPage";
import ShowcaseSevrPage from "./pages/showcase/ShowcaseSevrPage";
import ShowcaseAboutPage from "./pages/showcase/ShowcaseAboutPage";
import ShowcaseDocsPage from "./pages/showcase/ShowcaseDocsPage";
import LoginPage, { isAuthenticated } from "./pages/LoginPage";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import UploadPage from "./pages/UploadPage";
import ExportSharePage from "./pages/ExportSharePage";
import AuditTrailPage from "./pages/AuditTrailPage";
import DetectionAlertsPage from "./pages/DetectionAlertsPage";
import ProjectListPage from "./pages/ProjectListPage";
import ExternalCollaboratorPage from "./pages/ExternalCollaboratorPage";

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
        <Route path="/share/:token" element={<ExternalCollaboratorPage />} />

        {/* Track B: Core Operational Platform (Authenticated Enclave Shell) */}
        <Route path="/*" element={<ProtectedApp />} />
      </Routes>
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
        <Route path="/home" element={<ProjectWorkspace />} />
        <Route path="/app/projects" element={<ProjectWorkspace />} />
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/projects/:projectId" element={<ProjectWorkspace />} />
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
