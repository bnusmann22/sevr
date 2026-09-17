import { Link, useLocation } from "react-router-dom";
import { Shield, Lock, FileCode2, Workflow, BookOpen, LogIn, Layers } from "lucide-react";

export default function ShowcaseNavbar() {
  const location = useLocation();

  const navItems = [
    { label: "Overview", path: "/", icon: Shield },
    { label: "Security Architecture", path: "/security", icon: Lock },
    { label: ".sevr Format", path: "/sevr", icon: Layers },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/landing";
    }
    return location.pathname.startsWith(path) || location.pathname.startsWith(`/landing${path}`);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#090a0f]/90 border-b border-zinc-800/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand Identity */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-100 group-hover:border-zinc-500 transition-colors">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                SeVR
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-medium">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
              Scoped Enclave for Varsity Research
            </p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                  active
                    ? "bg-zinc-800 text-white font-semibold border border-zinc-700/80 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-emerald-400" : "text-zinc-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 bg-zinc-100 text-zinc-950 font-bold text-xs rounded-xl hover:bg-white transition-all flex items-center gap-2 active:scale-[0.98]"
          >
            <LogIn className="w-3.5 h-3.5 text-zinc-950" />
            <span>Launch Enclave</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
