import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Folder, ShieldAlert, ScrollText, Upload, Share2, Users } from "lucide-react";
import Logo from "./Logo";
import { readAuthSession } from "../../pages/LoginPage";
import { projectsApi } from "../../api/services";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const session = readAuthSession();
  const isAdmin = ["system_admin", "institution_admin"].includes(session?.role ?? "");
  const [hasProjects, setHasProjects] = useState(false);

  useEffect(() => {
    let active = true;

    const checkProjects = async () => {
      try {
        const list = await projectsApi.list();
        if (active) {
          setHasProjects(Array.isArray(list) && list.length > 0);
        }
      } catch {
        if (active) {
          setHasProjects(false);
        }
      }
    };

    checkProjects();

    const handler = () => checkProjects();
    window.addEventListener("sevr:projects-changed", handler);
    window.addEventListener("sevr:auth-success", handler);

    return () => {
      active = false;
      window.removeEventListener("sevr:projects-changed", handler);
      window.removeEventListener("sevr:auth-success", handler);
    };
  }, [location.pathname]);

  const navItems = [
    { path: "/home", label: "Projects", icon: Folder },
    ...(isAdmin ? [{ path: "/admin/users", label: "User Directory", icon: Users }] : []),
    { path: "/upload", label: "Upload File", icon: Upload },
    { path: "/export", label: "Export & Share", icon: Share2 },
    ...(hasProjects
      ? [
          { path: "/alerts", label: "Detection Queue", icon: ShieldAlert },
          { path: "/audit", label: "Audit Trail", icon: ScrollText },
        ]
      : []),
  ];

  return (
    <>
      {open && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/50 md:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 min-h-screen shrink-0 flex-col justify-between bg-slate-900 p-4 text-slate-100 transition-transform md:static md:z-auto md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div>
        <div className="mb-8 px-2">
          <Logo size="md" showSubtitle showVersion nameClassName="text-white" subtitleClassName="normal-case tracking-normal text-slate-400" />
        </div>

        <nav className="space-y-1 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-slate-800 text-emerald-400 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
                onClick={onClose}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4 px-2 text-xs text-slate-400 flex items-center justify-between">
        <span>SeVR Secure Enclave</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      </div>
      </aside>
    </>
  );
}
