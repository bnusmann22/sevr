import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { readAuthSession } from "../../pages/LoginPage";

type TopBarProps = {
  notificationsOpen: boolean;
  onToggleNotifications: () => void;
  onOpenNavigation: () => void;
  onLogout: () => void;
};

const notifications = [
  { id: "n1", title: "Review requested", detail: "A native export needs supervisor review.", time: "12 min ago" },
  { id: "n2", title: "Detection queue updated", detail: "One new anomaly is ready for review.", time: "1 hr ago" },
];

export default function TopBar({ notificationsOpen, onToggleNotifications, onOpenNavigation, onLogout }: TopBarProps) {
  const location = useLocation();
  const session = readAuthSession();
  const [logoutPromptOpen, setLogoutPromptOpen] = useState(false);
  const pageTitle = location.pathname.startsWith("/alerts") ? "Detection Queue"
    : location.pathname.startsWith("/audit") ? "Audit Trail"
    : location.pathname.startsWith("/upload") ? "Upload File"
    : location.pathname.startsWith("/export") ? "Export & Share" : "Projects";
  const initials = (session?.name ?? "SeVR User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = session?.role === "institution_admin" ? "Institution admin" : session?.role === "supervisor" ? "Supervisor" : "Researcher";

  return (
    <header className="relative z-20 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3 text-sm font-medium text-slate-600">
        <button type="button" onClick={onOpenNavigation} aria-label="Open navigation" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 md:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <span className="truncate">Workspace / <span className="font-semibold text-slate-900">{pageTitle}</span></span>
      </div>

      <div className="flex items-center gap-2 text-xs font-medium sm:gap-4">
        <button type="button" onClick={onToggleNotifications} aria-label={`${notifications.length} unread notifications`} aria-expanded={notificationsOpen} className="relative flex items-center rounded-lg p-2 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <Bell className="h-4 w-4 text-slate-600" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">{notifications.length}</span>
        </button>
        <div className="hidden items-center gap-2 border-l border-slate-200 pl-4 sm:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">{initials}</div>
          <div>
            <p className="font-semibold leading-tight text-slate-900">{session?.name ?? "SeVR User"}</p>
            <p className="text-[10px] text-slate-500">{roleLabel} / {session?.department ?? "Research"}</p>
          </div>
        </div>
        <button type="button" onClick={() => setLogoutPromptOpen(true)} aria-label="Log out" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {notificationsOpen && (
        <aside aria-label="Notifications" className="absolute right-4 top-14 w-[min(22rem,calc(100vw-2rem))] border border-slate-200 bg-white p-4 shadow-xl sm:right-6">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-slate-900">Notifications</h2><button type="button" onClick={onToggleNotifications} aria-label="Close notifications" className="rounded p-1 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
          <div className="space-y-3">{notifications.map((notification) => <div key={notification.id} className="border-l-2 border-emerald-500 pl-3"><p className="text-sm font-semibold text-slate-900">{notification.title}</p><p className="mt-1 text-xs leading-5 text-slate-600">{notification.detail}</p><p className="mt-1 text-[10px] text-slate-400">{notification.time}</p></div>)}</div>
        </aside>
      )}
      {logoutPromptOpen && <div className="absolute right-4 top-14 w-64 border border-slate-200 bg-white p-4 shadow-xl sm:right-6"><p className="text-sm font-semibold text-slate-900">Leave the enclave?</p><p className="mt-1 text-xs leading-5 text-slate-600">Your mock session will be cleared from this browser.</p><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setLogoutPromptOpen(false)} className="rounded px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100">Cancel</button><button type="button" onClick={onLogout} className="rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">Log out</button></div></div>}
    </header>
  );
}
