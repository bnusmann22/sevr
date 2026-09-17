import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Lock,
  Mail,
  Shield,
  UserRound,
} from "lucide-react";
import { apiClient } from "../api/client";

type AuthMode = "login" | "signup";
type AuthMethod = "credentials" | "sso";

type AuthSession = {
  email: string;
  name: string;
  role: "researcher" | "supervisor" | "institution_admin";
  token: string;
  authenticatedAt: string;
};

const institutionEmailPattern = /^[^\s@]+@(?:[a-z0-9-]+\.)*(?:edu\.ng|edu)$/i;
const supportEmail = "helpdesk@sevr.edu.ng";
const supportLink = "https://support.sevr.edu.ng/request-access";
const SESSION_KEY = "sevr-session";

export function readAuthSession(): AuthSession | null {
  const values = [window.localStorage.getItem(SESSION_KEY), window.sessionStorage.getItem(SESSION_KEY)];
  for (const value of values) {
    if (!value) continue;
    try {
      const parsed = JSON.parse(value) as Partial<AuthSession>;
      if (parsed?.email && parsed?.token && parsed?.role) {
        return parsed as AuthSession;
      }
    } catch {
      // Ignore malformed stored session data.
    }
  }
  return null;
}

export function persistAuthSession(session: AuthSession, rememberMe: boolean) {
  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated() {
  return Boolean(readAuthSession());
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode: AuthMode = useMemo(
    () => (location.pathname === "/signup" ? "signup" : "login"),
    [location.pathname],
  );

  const [authMethod, setAuthMethod] = useState<AuthMethod>("credentials");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  };

  const validateCredentials = () => {
    if (!form.email.trim()) {
      return "Institution email is required.";
    }

    if (!institutionEmailPattern.test(form.email)) {
      return "Use a valid academic email ending in .edu or .edu.ng.";
    }

    if (!form.password) {
      return "Password is required.";
    }

    if (form.password.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    if (mode === "signup") {
      if (!form.fullName.trim()) {
        return "Full name is required to create your account.";
      }
      if (!form.confirmPassword) {
        return "Please confirm your password.";
      }
      if (form.password !== form.confirmPassword) {
        return "Passwords do not match.";
      }
    }

    return "";
  };

  const handleCredentialsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateCredentials();
    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const response = await apiClient.post(endpoint, {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        fullName: form.fullName.trim(),
        rememberMe: form.rememberMe,
      });

      const session = response.data?.session as AuthSession | undefined;
      if (!session?.token || !session?.email || !session?.role) {
        throw new Error("Authentication response was incomplete.");
      }

      persistAuthSession(session, form.rememberMe);
      setError("");
      setSuccess(
        mode === "login"
          ? "Credentials verified. Opening your enclave workspace..."
          : "Account created. Welcome to the SeVR enclave...",
      );
      window.setTimeout(() => navigate("/home"), 600);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Unable to verify your credentials. Please try again.";
      setError(message);
      setSuccess("");
    }
  };

  const handleSsoLogin = async () => {
    setError("");
    setSuccess("Redirecting to the university identity provider...");

    try {
      const response = await apiClient.get<{ redirectUrl: string }>('/api/auth/sso/start');
      if (!response.data?.redirectUrl) {
        throw new Error("SSO authorization endpoint is unavailable.");
      }
      window.location.assign(response.data.redirectUrl);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "SSO is temporarily unavailable. Please use institutional credentials instead.";
      setError(message);
      setSuccess("");
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-800 bg-white p-6 shadow-2xl shadow-emerald-950/20 text-slate-900">
          <div className="flex items-center justify-center mb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-emerald-400 shadow-lg shadow-emerald-600/20">
              <KeyRound className="h-7 w-7" />
            </div>
          </div>

          <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                isLogin ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                !isLogin ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Create account
            </button>
          </div>

          <div className="mb-6 flex items-center gap-2 text-emerald-700">
            <Shield className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">
              Enclave identity gateway
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isLogin ? "Welcome back" : "Create your SeVR account"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isLogin
              ? "Access the secure research workspace with your institution credentials or university SSO."
              : "Register with your university email to join the protected research enclave."}
          </p>

          <div className="mt-6 mb-5 flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setAuthMethod("credentials")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                authMethod === "credentials" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Institution email
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("sso")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                authMethod === "sso" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              University SSO
            </button>
          </div>

          {authMethod === "credentials" ? (
            <form className="space-y-4" onSubmit={handleCredentialsSubmit}>
              {!isLogin && (
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <UserRound className="h-4 w-4 text-slate-500" />
                    Full name
                  </span>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    placeholder="Dr. Ada Okafor"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Mail className="h-4 w-4 text-slate-500" />
                  Institution email
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="researcher@bayero.edu.ng"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Lock className="h-4 w-4 text-slate-500" />
                  Password
                </span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder={isLogin ? "Enter your password" : "Create a secure password"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </label>

              {!isLogin && (
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Lock className="h-4 w-4 text-slate-500" />
                    Confirm password
                  </span>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) => updateField("confirmPassword", event.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                  />
                </label>
              )}

              <div className="flex items-center justify-between gap-3 pt-1 text-sm text-slate-600">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(event) => updateField("rememberMe", event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Remember this device
                </label>
                <Link to="/login" className="font-medium text-emerald-700 hover:text-emerald-800">
                  {isLogin ? "Need help?" : "Already have access?"}
                </Link>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
                  <span>{success}</span>
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
              >
                {isLogin ? "Sign in to enclave" : "Create account & continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  University single sign-on
                </div>
                <p>
                  Use your institutional identity provider to authenticate with MFA and access the
                  same enclave role-based permissions.
                </p>
              </div>

              {success && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
                  <span>{success}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSsoLogin}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Continue with Keycloak SSO
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Need help?
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Contact the enclave admin for access requests, institutional onboarding, or triage if
              your university email is not yet linked to your research account.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
              >
                {supportEmail}
              </a>
              <a
                href={supportLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Request access
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
