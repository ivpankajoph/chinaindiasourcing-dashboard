import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "cis_admin_session";
const protectedPrefixes = ["/dashboard", "/notifications", "/buyers", "/sellers", "/mailers", "/emails", "/explore-buyers", "/explore-sellers", "/purchased-leads"];

async function authenticatedUser(token: string) {
  const base = (process.env.BACKEND_URL || "http://localhost:8081").replace(/\/$/, "");
  try {
    const response = await fetch(`${base}/api/china-india-sourcing-admin/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = await response.json();
    return body?.data || null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const isLogin = pathname === "/login" || pathname === "/login/admin";
  if (!isProtected && !isLogin) return NextResponse.next();
  const adminOnly = pathname === "/buyers" || pathname.startsWith("/buyers/") || pathname === "/sellers" || pathname.startsWith("/sellers/") || pathname.startsWith("/mailers") || pathname.startsWith("/emails");
  if (!token) return isProtected ? NextResponse.redirect(new URL(adminOnly ? "/login/admin" : "/login", request.url)) : NextResponse.next();

  const user = await authenticatedUser(token);
  if (!user) {
    const response = isProtected ? NextResponse.redirect(new URL(adminOnly ? "/login/admin" : "/login", request.url)) : NextResponse.next();
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (isLogin) return NextResponse.redirect(new URL("/dashboard", request.url));

  if (adminOnly && user.roleKey !== "super_admin") return NextResponse.redirect(new URL("/dashboard", request.url));
  if (pathname.startsWith("/explore-sellers") && user.roleKey !== "buyer") return NextResponse.redirect(new URL("/dashboard", request.url));
  if (pathname.startsWith("/explore-buyers") && user.roleKey !== "seller") return NextResponse.redirect(new URL("/dashboard", request.url));
  if (pathname.startsWith("/purchased-leads") && user.roleKey !== "seller") return NextResponse.redirect(new URL("/dashboard", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/login/:path*", "/dashboard/:path*", "/notifications/:path*", "/buyers/:path*", "/sellers/:path*", "/mailers/:path*", "/emails/:path*", "/explore-buyers/:path*", "/explore-sellers/:path*", "/purchased-leads/:path*"],
};
