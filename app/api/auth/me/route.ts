import { NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function GET() {
  const response = await authorizedBackendFetch("/auth/me");
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function PUT(request: Request) {
  const incoming = await request.formData();
  const outgoing = new FormData();
  for (const [key, value] of incoming.entries()) outgoing.append(key, value);
  const response = await authorizedBackendFetch("/member/profile", { method: "PUT", body: outgoing });
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
