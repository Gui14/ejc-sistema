import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin-session";
import { getAdminGroups } from "@/features/admin/admin-repository";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: "Não autenticado.",
      },
      { status: 401 },
    );
  }

  try {
    const groups = await getAdminGroups();

    return NextResponse.json({
      ok: true,
      groups,
    });
  } catch (error) {
    console.error("Erro ao carregar inscrições:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível carregar as inscrições.",
      },
      { status: 500 },
    );
  }
}