import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import { apiClient } from "../api/client";
import Logo from "../components/layout/Logo";
import { generateCodeVerifier, generateCodeChallenge, generateRandomState, storeOidcState } from "../utils/pkce";

type AuthMode = "login" | "signup";
type AuthMethod = "credentials" | "sso";

export type AuthSession = {
  id?: string;
  email: string;
  name: string;
  role: "researcher" | "supervisor" | "institution_admin" | "system_admin";
  department?: string;
  title?: string;
  profile_completed?: boolean;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSsoLoading, setIsSsoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requestedDestination =
    typeof location.state?.from === "string" && location.state.from.startsWith("/")
      ? location.state.from
      : "/home";

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

    setIsSubmitting(true);
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
      window.dispatchEvent(new CustomEvent("sevr:auth-success"));
      setError("");
      setSuccess(
        mode === "login"
          ? "Credentials verified. Opening your enclave workspace..."
          : "Account created. Welcome to the SeVR enclave...",
      );
      window.setTimeout(() => navigate(requestedDestination, { replace: true }), 600);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Unable to verify your credentials. Please try again.";
      setError(message);
      setSuccess("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSsoLogin = async () => {
    setError("");
    setSuccess("Redirecting to the university identity provider...");
    setIsSsoLoading(true);

    try {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      const state = generateRandomState();
      storeOidcState(verifier, state, requestedDestination);

      let authEndpoint = "http://localhost:8081/realms/sevr/protocol/openid-connect/auth";
      let clientId = "sevr-web";
      try {
        const response = await apiClient.get<{ authorizationUrl: string; clientId?: string }>("/api/auth/sso/start");
        if (response.data?.authorizationUrl) {
          authEndpoint = response.data.authorizationUrl;
        }
        if (response.data?.clientId) {
          clientId = response.data.clientId;
        }
      } catch {
        // Fallback to local default endpoint
      }

      const redirectUri = `${window.location.origin}/auth/callback`;
      const authUrl = new URL(authEndpoint);
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "openid profile email");
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("code_challenge", challenge);
      authUrl.searchParams.set("code_challenge_method", "S256");

      window.location.assign(authUrl.toString());
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "SSO is temporarily unavailable. Please use institutional credentials instead.";
      setError(message);
      setSuccess("");
      setIsSsoLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <main className="min-h-screen bg-[#f4f7f6] text-slate-950 selection:bg-teal-200">
      <div className="grid min-h-screen lg:grid-cols-[minmax(320px,0.8fr)_minmax(520px,1.2fr)]">
        <aside className="relative hidden overflow-hidden bg-[#0b2528] p-10 text-[#e9f4ef] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-28 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full border border-teal-300/10" />
          <div className="absolute -right-8 top-1/2 h-[22rem] w-[22rem] -translate-y-1/2 rounded-full border border-teal-300/10" />
          <div className="absolute right-24 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-teal-300 shadow-[0_0_0_10px_rgba(94,234,212,0.08)]" />

          <div className="relative z-10 flex items-center gap-3">
            <Logo size="md" markClassName="bg-teal-300 text-[#0b2528]" nameClassName="text-[#e9f4ef]" />
          </div>

          <div className="relative z-10 max-w-sm">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.24em] text-teal-200/70">
              Scoped enclave for varsity research
            </p>
            <h2 className="max-w-xs text-4xl font-medium leading-[1.08] tracking-[-0.04em]">
              Your work,<br />within its boundary.
            </h2>
            <p className="mt-6 max-w-xs text-sm leading-6 text-slate-300">
              A focused workspace for institution-verified research, controlled sharing, and clear
              data boundaries.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
            Protected by institution identity
          </div>
        </aside>

        <section className="flex min-h-screen flex-col px-6 py-7 sm:px-12 lg:px-20">
          <header className="flex items-center justify-between lg:justify-end">
            <div className="flex items-center gap-2 lg:hidden">
              <Logo size="sm" markClassName="bg-[#0b2528] text-teal-300" nameClassName="text-slate-950" />
            </div>
            <a href={`mailto:${supportEmail}`} className="text-xs font-medium text-slate-500 transition hover:text-slate-900">
              Help desk <span className="ml-1 text-slate-300">/</span> {supportEmail}
            </a>
          </header>

          <div className="mx-auto flex w-full max-w-[30rem] flex-1 items-center py-12">
            <motion.div
              className="w-full max-w-[30rem]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-10">
                <h1 className="text-4xl font-medium tracking-[-0.045em] text-slate-950 sm:text-[2.75rem]">
                  {isLogin ? "Welcome back." : "Create your account."}
                </h1>
                <p className="mt-4 max-w-md text-[0.95rem] leading-6 text-slate-500">
                  {isLogin
                    ? "Sign in with your institution credentials to enter the protected workspace."
                    : "Use your university email to request a place in the protected research enclave."}
                </p>
              </div>

          <div className="mb-7 flex items-center gap-6 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setAuthMethod("credentials")}
              className={`text-sm font-medium transition ${
                authMethod === "credentials" ? "text-slate-950" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Email and password
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("sso")}
              className={`text-sm font-medium transition ${
                authMethod === "sso" ? "text-slate-950" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              University SSO
            </button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {authMethod === "credentials" ? (
            <motion.form
              key="credentials"
              className="space-y-5"
              onSubmit={handleCredentialsSubmit}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
            >
              {!isLogin && (
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Full name</span>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    placeholder="Dr. Ada Okafor"
                    className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-teal-700"
                  />
                </label>
              )}

              <label className="block" htmlFor="login-email">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Institution email</span>
                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="researcher@bayero.edu.ng"
                  className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-teal-700"
                />
              </label>

              <label className="block" htmlFor="login-password">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Password</span>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    placeholder={isLogin ? "Enter your password" : "Create a secure password"}
                    className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-3 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-teal-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 transition hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {!isLogin && (
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Confirm password</span>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(event) => updateField("confirmPassword", event.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-3 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-teal-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((visible) => !visible)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 transition hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                      title={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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
                <Link to="/login" className="font-medium text-teal-700 hover:text-teal-900">
                  {isLogin ? "Need help?" : "Already have access?"}
                </Link>
              </div>

              {error && (
                <div className="flex items-start gap-2 border-l-2 border-rose-500 bg-rose-50/70 px-3 py-2 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 border-l-2 border-teal-600 bg-teal-50/70 px-3 py-2 text-sm text-teal-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
                  <span>{success}</span>
                </div>
              )}

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 bg-[#0b2528] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
              >
                {isSubmitting ? "Verifying access..." : isLogin ? "Sign in to enclave" : "Create account & continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="sso"
              className="space-y-5"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="border border-slate-200 bg-white/60 p-5 text-sm text-slate-600">
                <div className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                  <Building2 className="h-4 w-4 text-teal-700" />
                  University single sign-on
                </div>
                <p>
                  Use your institutional identity provider to authenticate with MFA and access the
                  same enclave role-based permissions.
                </p>
              </div>

              {success && (
                <div className="flex items-start gap-2 border-l-2 border-teal-600 bg-teal-50/70 px-3 py-2 text-sm text-teal-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
                  <span>{success}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSsoLogin}
                disabled={isSsoLoading}
                className="flex w-full items-center justify-center gap-2 bg-[#0b2528] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
              >
                {isSsoLoading ? "Connecting to identity provider..." : "Continue with Keycloak SSO"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
          </AnimatePresence>

          <div className="mt-10 flex items-start gap-3 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
            <Shield className="mt-0.5 h-4 w-4 flex-none text-teal-700" />
            <p>
              Your identity is checked against your institution. Need access?{" "}
              <a href={supportLink} target="_blank" rel="noreferrer" className="font-semibold text-slate-800 underline decoration-slate-300 underline-offset-4 hover:decoration-teal-600">
                Contact the enclave admin
              </a>.
            </p>
          </div>
            </motion.div>
          </div>
          <footer className="text-xs text-slate-400">SeVR / secure research infrastructure</footer>
        </section>
      </div>
    </main>
  );
}
