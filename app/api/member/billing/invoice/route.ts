import { NextResponse } from "next/server";
import { authorizedBackendFetch } from "@/lib/backend";

export async function GET() {
  const response = await authorizedBackendFetch("/member/billing/invoice");
  if (!response) return NextResponse.json({ success: false, error: { message: "Authentication required" } }, { status: 401 });
  const contentType = response.headers.get("content-type") || "application/json";
  const disposition = response.headers.get("content-disposition") || "attachment; filename=market-invoice.pdf";
  return new NextResponse(response.body, {
    status: response.status,
    headers: { "Content-Type": contentType, "Content-Disposition": disposition },
  });
}
