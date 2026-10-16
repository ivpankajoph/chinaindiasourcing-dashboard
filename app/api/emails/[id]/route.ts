import { NextRequest, NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const response = await authorizedBackendFetch(`/emails/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) });
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
