import { NextRequest, NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  const response = await authorizedBackendFetch(`/revenue${query ? `?${query}` : ""}`);
  if (!response) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
