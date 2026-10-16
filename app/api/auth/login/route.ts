import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, backendUrl } from "@/lib/backend";

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(backendUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    });
    const body = await response.json();
    const token = body.data?.token;
    if (token) delete body.data.token;
    const nextResponse = NextResponse.json(body, { status: response.status });
    if (response.ok && token) {
      nextResponse.cookies.set(ADMIN_SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 12,
      });
    }
    return nextResponse;
  } catch {
    return NextResponse.json({ success: false, error: { message: "Backend is unavailable" } }, { status: 503 });
  }
}
