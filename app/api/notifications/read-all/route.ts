import { NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function PATCH() {
  const response = await authorizedBackendFetch("/notifications/read-all", { method: "PATCH" });
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
