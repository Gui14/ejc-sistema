import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin-session";
import { getAdminSummary } from "@/features/admin/admin-repository";

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
    const summary = await getAdminSummary();

    return NextResponse.json({
      ok: true,
      summary,
    });
  } catch (error) {
    console.error("Erro ao carregar resumo administrativo:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível carregar o resumo.",
      },
      { status: 500 },
    );
  }
}