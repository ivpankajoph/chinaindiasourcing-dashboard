import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/backend";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/.test(token)) return NextResponse.json({ success: false, error: { message: "Invalid lead link" } }, { status: 400 });
  try {
    const response = await fetch(backendUrl(`/lead-invitations/${token}`), { cache: "no-store" });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ success: false, error: { message: "Backend is unavailable" } }, { status: 503 });
  }
}
