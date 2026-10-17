import { NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const response = await authorizedBackendFetch(`/notifications/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
