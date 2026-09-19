import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../components/layout/Logo";
import { retrieveOidcState, clearOidcState } from "../utils/pkce";
import { apiClient } from "../api/client";
import { persistAuthSession, clearAuthSession, AuthSession } from "./LoginPage";

type AuthStatusPageProps = {
  mode: "callback" | "expired";
};

export default function AuthStatusPage({ mode }: AuthStatusPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(mode === "callback");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "expired") {
      clearAuthSession();
      clearOidcState();
      return;
    }

    const processCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (errorParam) {
        setError(errorDescription || `Authentication error: ${errorParam}`);
        setProcessing(false);
        return;
      }

      if (!code) {
        setError("Missing authorization code from identity provider.");
        setProcessing(false);
        return;
      }

      const { verifier, state: storedState, destination } = retrieveOidcState();
      if (storedState && state && storedState !== state) {
        console.warn("State parameter mismatch; continuing with caution.");
      }

      try {
        const redirectUri = `${window.location.origin}/auth/callback`;
        const response = await apiClient.post<{ session: AuthSession }>("/api/auth/sso/callback", {
          code,
          code_verifier: verifier || "",
          redirect_uri: redirectUri,
        });

        const session = response.data?.session;
        if (!session?.token) {
          throw new Error("Identity exchange completed without token issuance.");
        }

        persistAuthSession(session, true);
        clearOidcState();
        window.dispatchEvent(new CustomEvent("sevr:auth-success"));
        setSuccess(`Welcome, ${session.name || session.email}. Redirecting to your workspace...`);

        window.setTimeout(() => {
          navigate(destination || "/home", { replace: true });
        }, 800);
      } catch (err: unknown) {
        console.error("SSO callback error:", err);
        const msg = err instanceof Error && err.message ? err.message : "Unable to complete single sign-on authentication.";
        setError(msg);
      } finally {
        setProcessing(false);
      }
    };

    processCallback();
  }, [mode, searchParams, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7f6] px-6 py-12 text-slate-950">
      <section className="w-full max-w-md border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <Logo size="md" markClassName="bg-[#0b2528] text-teal-300" nameClassName="text-slate-950" />
        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            {mode === "expired" ? "Session boundary" : "Identity gateway"}
          </p>
          <h1 className="mt-3 text-3xl font-medium tracking-tight text-slate-950">
            {mode === "expired"
              ? "Your session has expired"
              : error
              ? "Authentication Issue"
              : success
              ? "Identity Verified"
              : "Connecting Identity"}
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {mode === "expired"
              ? "Your secure session token is no longer active. Sign in again to return to the protected research enclave."
              : error
              ? error
              : success
              ? success
              : "Verifying single sign-on credentials with varsity identity provider..."}
          </p>

          <div
            className={`mt-7 flex items-center gap-3 border-l-2 px-4 py-3 text-sm ${
              error
                ? "border-rose-600 bg-rose-50 text-rose-800"
                : success
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-teal-600 bg-teal-50 text-slate-700"
            }`}
            role="status"
          >
            {processing ? (
              <>
                <LoaderCircle className="h-5 w-5 flex-none animate-spin text-teal-600" />
                <span>Exchanging OIDC code with enclave identity gateway...</span>
              </>
            ) : error ? (
              <>
                <AlertCircle className="h-5 w-5 flex-none text-rose-600" />
                <span>Authentication could not be completed.</span>
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="h-5 w-5 flex-none text-emerald-600" />
                <span>Identity confirmed. Transitioning...</span>
              </>
            ) : (
              <>
                <LockKeyhole className="h-5 w-5 flex-none text-amber-600" />
                <span>Your local session is no longer active.</span>
              </>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#0b2528] px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-900"
            >
              <LockKeyhole className="h-4 w-4" />
              Return to sign in
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Public showcase
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
