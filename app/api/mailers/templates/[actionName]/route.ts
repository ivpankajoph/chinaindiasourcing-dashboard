import { NextRequest, NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function GET(_request: NextRequest, context: { params: Promise<{ actionName: string }> }) {
  const { actionName } = await context.params;
  const response = await authorizedBackendFetch(`/mailers/templates/${encodeURIComponent(actionName)}`);
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ actionName: string }> }) {
  const { actionName } = await context.params;
  const response = await authorizedBackendFetch(`/mailers/templates/${encodeURIComponent(actionName)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) });
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
