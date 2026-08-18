import { NextResponse } from "next/server";

import { getEventoById } from "@/features/eventos/eventos-repository";
import {
  deleteMovimento,
  getMovimentoById,
  updateMovimento,
  type MovementStatus,
  type MovementType,
} from "@/features/financeiro/movimentacoes-repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    eventoId: string;
    movimentacaoId: string;
  }>;
};

type Body = Record<string, unknown>;

function text(body: Body, field: string, label: string, required = true) {
  const value = body[field];
  if (typeof value !== "string" || (required && !value.trim())) {
    if (required) throw new Error(`${label} é obrigatório.`);
    return "";
  }
  return value.trim();
}

function amount(body: Body) {
  const value = body.amount;
  const parsed = typeof value === "number" ? value : Number(String(value ?? "").replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error("Informe um valor válido maior que zero.");
  return parsed;
}

function movementType(body: Body): MovementType {
  const value = text(body, "type", "Tipo da movimentação");
  if (value !== "ENTRADA" && value !== "SAIDA") throw new Error("Tipo de movimentação inválido.");
  return value;
}

function movementStatus(body: Body): MovementStatus {
  const value = text(body, "status", "Status da movimentação");
  if (value !== "PENDENTE" && value !== "CONFIRMADO" && value !== "CANCELADO") throw new Error("Status da movimentação inválido.");
  return value;
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}

async function getParams(context: RouteContext) {
  const params = await context.params;
  return { eventoId: params.eventoId?.trim(), movimentacaoId: params.movimentacaoId?.trim() };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { eventoId, movimentacaoId } = await getParams(context);
    if (!eventoId || !movimentacaoId) return NextResponse.json({ ok: false, error: "IDs não informados." }, { status: 400 });

    const movimento = await getMovimentoById(movimentacaoId);
    if (!movimento || movimento.eventoId !== eventoId) return NextResponse.json({ ok: false, error: "Movimentação não encontrada." }, { status: 404 });

    return NextResponse.json({ ok: true, movimentacao: movimento });
  } catch (error) {
    console.error("Erro ao consultar movimentação:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível consultar a movimentação." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { eventoId, movimentacaoId } = await getParams(context);
    if (!eventoId || !movimentacaoId) return NextResponse.json({ ok: false, error: "IDs não informados." }, { status: 400 });

    const evento = await getEventoById(eventoId);
    if (!evento) return NextResponse.json({ ok: false, error: "Evento não encontrado." }, { status: 404 });

    const current = await getMovimentoById(movimentacaoId);
    if (!current || current.eventoId !== eventoId) return NextResponse.json({ ok: false, error: "Movimentação não encontrada." }, { status: 404 });

    const body = (await request.json()) as Body;
    const date = text(body, "date", "Data da movimentação");
    if (!validDate(date)) return NextResponse.json({ ok: false, error: "Informe uma data válida." }, { status: 400 });

    const movimentacao = await updateMovimento({
      id: movimentacaoId,
      eventoId,
      type: movementType(body),
      description: text(body, "description", "Descrição"),
      category: text(body, "category", "Categoria"),
      amount: amount(body),
      date,
      paymentMethod: text(body, "paymentMethod", "Forma de pagamento", false),
      responsible: text(body, "responsible", "Responsável", false),
      receiptUrl: text(body, "receiptUrl", "Comprovante", false),
      status: movementStatus(body),
      notes: text(body, "notes", "Observações", false),
    });

    return NextResponse.json({ ok: true, message: "Movimentação atualizada com sucesso.", movimentacao });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível atualizar a movimentação.";
    console.error("Erro ao atualizar movimentação:", error);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { eventoId, movimentacaoId } = await getParams(context);
    if (!eventoId || !movimentacaoId) return NextResponse.json({ ok: false, error: "IDs não informados." }, { status: 400 });

    const current = await getMovimentoById(movimentacaoId);
    if (!current || current.eventoId !== eventoId) return NextResponse.json({ ok: false, error: "Movimentação não encontrada." }, { status: 404 });

    await deleteMovimento(movimentacaoId);
    return NextResponse.json({ ok: true, message: "Movimentação excluída com sucesso." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível excluir a movimentação.";
    console.error("Erro ao excluir movimentação:", error);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}