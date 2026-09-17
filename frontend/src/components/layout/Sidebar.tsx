import { Link, useLocation } from "react-router-dom";
import { Folder, ShieldAlert, ScrollText, Upload, Share2, Shield } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: "/home", label: "Projects", icon: Folder },
    { path: "/upload", label: "Upload File", icon: Upload },
    { path: "/export", label: "Export & Share", icon: Share2 },
    { path: "/alerts", label: "Detection Queue", icon: ShieldAlert },
    { path: "/audit", label: "Audit Trail", icon: ScrollText },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-sm shadow-md">
            <Shield className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white">SeVR Enclave</h1>
            <p className="text-[10px] text-slate-400">Varsity Research v1.0</p>
          </div>
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
  );
}
