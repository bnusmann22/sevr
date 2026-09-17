import { Bell } from "lucide-react";

export default function TopBar() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shadow-sm">
      <div className="text-sm font-medium text-slate-600">
        Workspace: <span className="font-semibold text-slate-900">Quantum Encryption Lab</span>
      </div>

      <div className="flex items-center gap-4 text-xs font-medium">
        <div className="relative cursor-pointer p-2 rounded-lg hover:bg-slate-100 transition flex items-center">
          <Bell className="w-4 h-4 text-slate-600" />
          <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold shadow-xs">
            2
          </span>
        </div>
        <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
          <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
            DA
          </div>
          <div>
            <p className="font-semibold text-slate-900 leading-tight">Dr. Abdullahi</p>
            <p className="text-[10px] text-slate-500">Supervisor / PI</p>
          </div>
        </div>
      </div>
    </header>
  );
}
