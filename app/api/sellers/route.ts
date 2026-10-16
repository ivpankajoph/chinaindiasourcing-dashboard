import { NextRequest, NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function GET(request: NextRequest) {
  const response = await authorizedBackendFetch(`/sellers${request.nextUrl.search}`);
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
