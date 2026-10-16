import { NextRequest, NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function GET() {
  const response = await authorizedBackendFetch("/mailers/accounts");
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function PATCH(request: NextRequest) {
  const response = await authorizedBackendFetch("/mailers/accounts/default", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) });
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function POST(request: NextRequest) {
  const response = await authorizedBackendFetch("/mailers/accounts/aliases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) });
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function DELETE(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address") || "";
  const response = await authorizedBackendFetch(`/mailers/accounts/aliases/${encodeURIComponent(address)}`, { method: "DELETE" });
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
