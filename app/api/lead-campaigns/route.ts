import { NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function POST(request: Request) {
  const payload = await request.json();
  const response = await authorizedBackendFetch("/lead-campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, dashboardBaseUrl: process.env.CIS_DASHBOARD_URL || new URL(request.url).origin }),
  });
  if (!response) return NextResponse.json({ success: false, error: { message: "Sign in as admin" } }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
