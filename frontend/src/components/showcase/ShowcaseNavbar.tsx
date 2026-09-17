import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Lock, Layers, LogIn, Menu, X, BookOpen, FileCheck } from "lucide-react";

export default function ShowcaseNavbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-100/90 border-b border-slate-300/80 md:bg-[#090a0f]/90 md:border-zinc-800/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand Identity */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-200 border border-slate-300 md:bg-zinc-900 md:border-zinc-700/80 flex items-center justify-center text-slate-800 md:text-zinc-100 group-hover:border-emerald-600 transition-colors">
            <Shield className="w-4 h-4 text-emerald-700 md:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 md:text-white group-hover:text-slate-700 md:group-hover:text-zinc-200 transition-colors">
                SeVR
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 border border-slate-300 text-slate-700 md:bg-zinc-900 md:border-zinc-700 md:text-zinc-300 font-medium">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 md:text-zinc-400 font-mono tracking-wider uppercase hidden sm:block">
              Scoped Enclave for Varsity Research
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Tabs */}
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
                    ? "bg-zinc-800 text-white font-semibold border border-zinc-700/80"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-emerald-400" : "text-zinc-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Button & Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Only: Launch Enclave */}
          <Link
            to="/login"
            className="hidden md:flex px-4 py-2 bg-zinc-100 text-zinc-950 font-bold text-xs rounded-xl hover:bg-white transition-all items-center gap-2 active:scale-[0.98]"
          >
            <LogIn className="w-3.5 h-3.5 text-zinc-950" />
            <span>Launch Enclave</span>
          </Link>

          {/* Hamburger Menu Toggle Button (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-700" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Drawer */}
      {mobileMenuOpen && (
        <nav className="md:hidden px-4 pt-2 pb-4 bg-slate-100 border-b border-slate-300 space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-3 ${
                  active
                    ? "bg-white text-slate-900 font-bold border border-slate-300"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-emerald-700" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-300 space-y-2">
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-3 hover:bg-slate-300/80 transition"
            >
              <BookOpen className="w-4 h-4 text-slate-700" />
              <span>View Documentation Only</span>
            </Link>

            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 text-white flex items-center gap-3 hover:bg-emerald-800 transition"
            >
              <FileCheck className="w-4 h-4 text-emerald-200" />
              <span>Access Research Portal</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
