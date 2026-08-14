import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/auth/admin-session";

export const runtime = "nodejs";

export async function POST() {
  await destroyAdminSession();

  return NextResponse.json({
    ok: true,
  });
}