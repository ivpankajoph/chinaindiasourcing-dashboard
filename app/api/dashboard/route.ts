import { NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function GET() {
  const response = await authorizedBackendFetch("/dashboard");
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
