import { NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const response = await authorizedBackendFetch(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
