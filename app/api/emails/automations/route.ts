import { NextRequest, NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function GET(request: NextRequest) {
  const response = await authorizedBackendFetch(
    `/emails/automations?${request.nextUrl.searchParams.toString()}`,
  );
  if (!response) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
