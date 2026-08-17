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
          error: "ID do Pai adotivo não informado.",
        },
        { status: 400 },
      );
    }

    await softDeleteSponsor(sponsorId);

    return NextResponse.json({
      ok: true,
      sponsorId,
      message: "Pai adotivo excluído com sucesso.",
    });
  } catch (error) {
    console.error(
      "Erro ao excluir Pai adotivo:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o Pai adotivo.",
      },
      { status: 500 },
    );
  }
}