import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, backendUrl } from "@/lib/backend";

export async function POST(request: Request, { params }: { params: Promise<{ token: string; action: string }> }) {
  const { token, action } = await params;
  if (!/^[a-f0-9]{64}$/.test(token) || !["claim", "password"].includes(action)) {
    return NextResponse.json({ success: false, error: { message: "Invalid lead link" } }, { status: 400 });
  }
  try {
    const response = await fetch(backendUrl(`/lead-invitations/${token}/${action}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    });
    const body = await response.json();
    const session = body.data?.token;
    if (session) delete body.data.token;
    const result = NextResponse.json(body, { status: response.status });
    if (response.ok && session) result.cookies.set(ADMIN_SESSION_COOKIE, session, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return result;
  } catch {
    return NextResponse.json({ success: false, error: { message: "Backend is unavailable" } }, { status: 503 });
  }
}
