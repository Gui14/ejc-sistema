import { NextResponse } from "next/server";

import {
  softDeleteSponsor,
} from "@/features/admin/admin-repository";

type RouteContext = {
  params: Promise<{
    sponsorId: string;
  }>;
};

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { sponsorId } =
      await context.params;

    if (!sponsorId) {
      return NextResponse.json(
        {
          ok: false,
          error: "ID do padrinho não informado.",
        },
        { status: 400 },
      );
    }

    await softDeleteSponsor(sponsorId);

    return NextResponse.json({
      ok: true,
      sponsorId,
      message: "Padrinho excluído com sucesso.",
    });
  } catch (error) {
    console.error(
      "Erro ao excluir padrinho:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o padrinho.",
      },
      { status: 500 },
    );
  }
}