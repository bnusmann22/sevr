import { BrowserRouter, Routes, Route } from "react-router-dom";
import Shell from "./components/layout/Shell";
import ShowcaseOverviewPage from "./pages/showcase/ShowcaseOverviewPage";
import ShowcaseSecurityPage from "./pages/showcase/ShowcaseSecurityPage";
import ShowcaseWorkflowsPage from "./pages/showcase/ShowcaseWorkflowsPage";
import ShowcaseSevrPage from "./pages/showcase/ShowcaseSevrPage";
import ShowcaseAboutPage from "./pages/showcase/ShowcaseAboutPage";
import ShowcaseDocsPage from "./pages/showcase/ShowcaseDocsPage";
import LoginPage from "./pages/LoginPage";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import UploadPage from "./pages/UploadPage";
import ExportSharePage from "./pages/ExportSharePage";
import AuditTrailPage from "./pages/AuditTrailPage";
import DetectionAlertsPage from "./pages/DetectionAlertsPage";

export default function App() {
  return (
    <BrowserRouter>
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

        {/* Track B: Core Operational Platform (Authenticated Enclave Shell) */}
        <Route
          path="/*"
          element={
            <Shell>
              <Routes>
                <Route path="/home" element={<ProjectWorkspace />} />
                <Route path="/app/projects" element={<ProjectWorkspace />} />
                <Route path="/projects" element={<ProjectWorkspace />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/export" element={<ExportSharePage />} />
                <Route path="/audit" element={<AuditTrailPage />} />
                <Route path="/app/audit" element={<AuditTrailPage />} />
                <Route path="/alerts" element={<DetectionAlertsPage />} />
                <Route path="/app/alerts" element={<DetectionAlertsPage />} />
              </Routes>
            </Shell>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
