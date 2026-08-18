import { NextResponse } from "next/server";

import {
  getEncontreiros,
} from "@/features/encontreiros/encontreiros-repository";

export const runtime = "nodejs";

export async function GET() {
  try {
    const encontreiros =
      await getEncontreiros();

    return NextResponse.json({
      ok: true,
      encontreiros,
    });
  } catch (error) {
    console.error(
      "Erro ao listar encontreiros:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os encontreiros.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
) {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Novos encontreiros devem ser cadastrados pela página pública.",
    },
    { status: 405 },
  );
}