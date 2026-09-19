import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, LogOut, Menu, X, Check, CheckCircle2, UserCheck, Mail, ShieldAlert } from "lucide-react";
import { readAuthSession } from "../../pages/LoginPage";
import { apiClient } from "../../api/client";
import { invitationsApi } from "../../api/services";
import type { ProjectInvitation } from "../../types";
import ProfileModal from "../modals/ProfileModal";

type TopBarProps = {
  notificationsOpen: boolean;
  onToggleNotifications: () => void;
  onOpenNavigation: () => void;
  onLogout: () => void;
};

type Notification = { id: string; title: string; detail: string; time: string; read: boolean };

export default function TopBar({ notificationsOpen, onToggleNotifications, onOpenNavigation, onLogout }: TopBarProps) {
  const location = useLocation();
  const session = readAuthSession();
  const [logoutPromptOpen, setLogoutPromptOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<ProjectInvitation[]>([]);
  const [notificationError, setNotificationError] = useState("");
  const [actioningInviteId, setActioningInviteId] = useState<string | null>(null);

  const loadNotifications = () => {
    apiClient
      .get<Notification[]>("/notifications")
      .then(({ data }) => setNotifications(data))
      .catch(() => setNotificationError("Unable to load notifications."));

    invitationsApi
      .listPendingForMe()
      .then((data) => setPendingInvitations(data.filter((i) => i.status === "pending")))
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
  }, [notificationsOpen]);

  const unreadCount =
    notifications.filter((notification) => !notification.read).length + pendingInvitations.length;

  const markRead = async (id: string) => {
    try {
      await apiClient.post(`/notifications/${id}/read`);
      setNotifications((current) =>
        current.map((notification) => (notification.id === id ? { ...notification, read: true } : notification))
      );
    } catch {
      setNotificationError("Unable to update notification state.");
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    setActioningInviteId(inviteId);
    try {
      await invitationsApi.accept(inviteId);
      setPendingInvitations((prev) => prev.filter((i) => i.id !== inviteId));
      window.dispatchEvent(new CustomEvent("sevr:refresh-roster"));
      window.dispatchEvent(new CustomEvent("sevr:projects-changed"));
    } catch {
      setNotificationError("Unable to accept invitation.");
    } finally {
      setActioningInviteId(null);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    setActioningInviteId(inviteId);
    try {
      await invitationsApi.decline(inviteId);
      setPendingInvitations((prev) => prev.filter((i) => i.id !== inviteId));
    } catch {
      setNotificationError("Unable to decline invitation.");
    } finally {
      setActioningInviteId(null);
    }
  };

  const pageTitle = location.pathname.startsWith("/admin/users")
    ? "System Admin / Users"
    : location.pathname.startsWith("/alerts")
    ? "Detection Queue"
    : location.pathname.startsWith("/audit")
    ? "Audit Trail"
    : location.pathname.startsWith("/upload")
    ? "Upload File"
    : location.pathname.startsWith("/export")
    ? "Export & Share"
    : "Projects";

  const initials = (session?.name ?? "SeVR User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel =
    session?.role === "system_admin"
      ? "System Admin"
      : session?.role === "institution_admin"
      ? "Institution Admin"
      : session?.role === "supervisor"
      ? "Supervisor"
      : "Researcher";

  const isProfileIncomplete = session?.profile_completed === false;

  return (
    <>
      <header className="relative z-20 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-xs sm:px-6">
        <div className="flex min-w-0 items-center gap-3 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={onOpenNavigation}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="truncate">
            Workspace / <span className="font-semibold text-slate-900">{pageTitle}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium sm:gap-4">
          {isProfileIncomplete && (
            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              className="hidden items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-xs hover:bg-amber-100 sm:flex"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Complete Profile
            </button>
          )}

          <button
            type="button"
            onClick={onToggleNotifications}
            aria-label={`${unreadCount} unread notifications`}
            aria-expanded={notificationsOpen}
            className="relative flex items-center rounded-lg p-2 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <Bell className="h-4 w-4 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Chip */}
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            title="Edit Academic Profile & KYC"
            className="hidden items-center gap-2 border-l border-slate-200 pl-4 transition hover:opacity-80 sm:flex text-left"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="font-semibold leading-tight text-slate-900">
                {session?.title ? `${session.title} ` : ""}
                {session?.name ?? "SeVR User"}
              </p>
              <p className="text-[10px] text-slate-500">
                {roleLabel} / {session?.department ?? "Research"}
              </p>
            </div>
          </button>

          <button
            id="topbar-logout-btn"
            type="button"
            onClick={() => setLogoutPromptOpen(true)}
            aria-label="Log out"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Notifications Drawer */}
        {notificationsOpen && (
          <aside
            aria-label="Notifications"
            className="absolute right-4 top-14 w-[min(24rem,calc(100vw-2rem))] border border-slate-200 bg-white p-4 shadow-xl sm:right-6 rounded-lg"
          >
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="font-semibold text-slate-900">Notifications &amp; Invites</h2>
              <button
                type="button"
                onClick={onToggleNotifications}
                aria-label="Close notifications"
                className="rounded p-1 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {notificationError && (
              <p role="alert" className="mb-3 text-xs text-rose-700">
                {notificationError}
              </p>
            )}

            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {/* Actionable Pending Invitations Section */}
              {pendingInvitations.length > 0 && (
                <div className="space-y-2 border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    Project Invitations ({pendingInvitations.length})
                  </span>
                  {pendingInvitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs"
                    >
                      <div className="flex items-start gap-2">
                        <Mail className="mt-0.5 h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">
                            {inv.projectName || "Enclave Collaboration"}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-600">
                            Invited by {inv.inviterName || inv.inviterEmail}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={actioningInviteId === inv.id}
                          onClick={() => handleDeclineInvite(inv.id)}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          disabled={actioningInviteId === inv.id}
                          onClick={() => handleAcceptInvite(inv.id)}
                          className="rounded bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                        >
                          {actioningInviteId === inv.id ? "Joining..." : "Accept"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* General Notifications */}
              {notifications.length === 0 && pendingInvitations.length === 0 && !notificationError ? (
                <p className="py-4 text-center text-sm text-slate-500">No notifications.</p>
              ) : (
                notifications.map((notification) => (
                  <button
                    type="button"
                    key={notification.id}
                    onClick={() => !notification.read && markRead(notification.id)}
                    className={`block w-full border-l-2 pl-3 text-left ${
                      notification.read ? "border-slate-200 opacity-60" : "border-emerald-500"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{notification.detail}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {notification.time}
                      {!notification.read && " · Mark as read"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Logout Prompt */}
        {logoutPromptOpen && (
          <div className="absolute right-4 top-14 w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-xl sm:right-6">
            <p className="text-sm font-semibold text-slate-900">Leave the enclave?</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">Your session will be cleared from this browser.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLogoutPromptOpen(false)}
                className="rounded px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                id="topbar-logout-confirm-btn"
                type="button"
                onClick={onLogout}
                className="rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSaved={() => loadNotifications()}
      />
    </>
  );
}
