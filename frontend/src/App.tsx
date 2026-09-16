import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import UploadPage from "./pages/UploadPage";
import ExportSharePage from "./pages/ExportSharePage";
import AuditTrailPage from "./pages/AuditTrailPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <nav className="border-b border-neutral-200 px-6 py-4 flex gap-6 text-sm font-medium">
          <span className="font-semibold tracking-tight">SeVR</span>
          <Link to="/">Workspace</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/export">Export &amp; Share</Link>
          <Link to="/audit">Audit Trail</Link>
        </nav>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<ProjectWorkspace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/export" element={<ExportSharePage />} />
            <Route path="/audit" element={<AuditTrailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
