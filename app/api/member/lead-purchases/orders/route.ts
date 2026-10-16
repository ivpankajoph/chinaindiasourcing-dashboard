import { NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function POST(request: Request) {
  const response = await authorizedBackendFetch("/member/lead-purchases/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) });
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
