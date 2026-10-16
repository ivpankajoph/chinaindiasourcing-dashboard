import { NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function POST() {
  const response = await authorizedBackendFetch("/market-directory/sync", { method: "POST" });
  if (!response) return NextResponse.json({ success: false, error: { message: "Authentication required" } }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
