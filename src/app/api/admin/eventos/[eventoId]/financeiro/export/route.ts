import { NextResponse } from "next/server";

import { getEventoById } from "@/features/eventos/eventos-repository";
import { getMovimentacoesByEvento } from "@/features/financeiro/movimentacoes-repository";
import { buildMovimentacoesCsv } from "@/features/financeiro/financeiro-export-utils";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ eventoId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { eventoId } = await context.params;
  const id = eventoId?.trim();

  if (!id) {
    return NextResponse.json({ ok: false, error: "ID do evento não informado." }, { status: 400 });
  }

  const evento = await getEventoById(id);
  if (!evento) {
    return NextResponse.json({ ok: false, error: "Evento não encontrado." }, { status: 404 });
  }

  const movements = await getMovimentacoesByEvento(id);
  const csv = `\uFEFF${buildMovimentacoesCsv(movements)}`;
  const filename = `financeiro-${id}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}