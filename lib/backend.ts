import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "cis_admin_session";

export function backendUrl(path: string) {
  const base = process.env.BACKEND_URL || "http://localhost:8081";
  return `${base.replace(/\/$/, "")}/api/china-india-sourcing-admin${path}`;
}

export async function authorizedBackendFetch(path: string, init?: RequestInit) {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return fetch(backendUrl(path), {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}
