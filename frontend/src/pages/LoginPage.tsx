import { Link } from "react-router-dom";
import { KeyRound, Shield, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
      <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl border border-slate-200">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-md">
          <KeyRound className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-1">Keycloak Authentication</h2>
        <p className="text-xs text-slate-500 mb-6 flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          OIDC Single Sign-On Identity Provider
        </p>

        <Link
          to="/home"
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold text-xs hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
        >
          Authenticate &amp; Launch Enclave
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
