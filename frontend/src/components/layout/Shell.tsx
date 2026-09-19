import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import OfflineBanner from "./OfflineBanner";
import PendingInvitesModal from "../modals/PendingInvitesModal";
import ProfileModal from "../modals/ProfileModal";
import { clearAuthSession, readAuthSession } from "../../pages/LoginPage";

export default function Shell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const session = readAuthSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => window.navigator.onLine);
  const [profilePromptOpen, setProfilePromptOpen] = useState(() => session?.profile_completed === false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <TopBar
          notificationsOpen={notificationsOpen}
          onToggleNotifications={() => setNotificationsOpen((open) => !open)}
          onOpenNavigation={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        {!isOnline && <OfflineBanner />}
        <main className="p-6 flex-1 overflow-auto">{children}</main>
      </div>

      {/* Post-login Collaboration Handshake */}
      <PendingInvitesModal />

      {/* Mandatory KYC Setup on First Login */}
      {profilePromptOpen && (
        <ProfileModal
          isOpen={profilePromptOpen}
          onClose={() => setProfilePromptOpen(false)}
          onSaved={() => setProfilePromptOpen(false)}
        />
      )}
    </div>
  );
}
