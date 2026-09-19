// RFC 7636 PKCE (Proof Key for Code Exchange) Utility

function base64UrlEncode(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateCodeVerifier(length = 64): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += possible[randomValues[i] % possible.length];
  }
  return result;
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

export function generateRandomState(length = 32): string {
  return generateCodeVerifier(length);
}

const PKCE_VERIFIER_KEY = "sevr_oidc_code_verifier";
const PKCE_STATE_KEY = "sevr_oidc_state";
const PKCE_DESTINATION_KEY = "sevr_oidc_destination";

export function storeOidcState(verifier: string, state: string, destination = "/home") {
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  sessionStorage.setItem(PKCE_STATE_KEY, state);
  sessionStorage.setItem(PKCE_DESTINATION_KEY, destination);
}

export function retrieveOidcState(): { verifier: string | null; state: string | null; destination: string } {
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
  const state = sessionStorage.getItem(PKCE_STATE_KEY);
  const destination = sessionStorage.getItem(PKCE_DESTINATION_KEY) || "/home";
  return { verifier, state, destination };
}

export function clearOidcState() {
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(PKCE_STATE_KEY);
  sessionStorage.removeItem(PKCE_DESTINATION_KEY);
}
