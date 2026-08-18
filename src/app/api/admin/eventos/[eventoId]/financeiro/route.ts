import { NextResponse } from "next/server";

import { getEventoById } from "@/features/eventos/eventos-repository";
import {
  calculateFinancialSummary,
  createMovimento,
  getMovimentacoesByEvento,
  type MovementStatus,
  type MovementType,
} from "@/features/financeiro/movimentacoes-repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    eventoId: string;
  }>;
};

type Body = Record<string, unknown>;

function requiredText(body: Body, field: string, label: string) {
  const value = body[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} é obrigatório.`);
  }
  return value.trim();
}

function optionalText(body: Body, field: string) {
  const value = body[field];
  return typeof value === "string" ? value.trim() : "";
}

function parseAmount(body: Body) {
  const value = body.amount;
  const amount = typeof value === "number"
    ? value
    : Number(String(value ?? "").replace(/\./g, "").replace(",", "."));

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Informe um valor válido maior que zero.");
  }

  return amount;
}

function getType(body: Body): MovementType {
  const type = requiredText(body, "type", "Tipo da movimentação");
  if (type !== "ENTRADA" && type !== "SAIDA") {
    throw new Error("Tipo de movimentação inválido.");
  }
  return type;
}

function getStatus(body: Body): MovementStatus {
  const status = optionalText(body, "status") || "PENDENTE";
  if (status !== "PENDENTE" && status !== "CONFIRMADO" && status !== "CANCELADO") {
    throw new Error("Status da movimentação inválido.");
  }
  return status;
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

async function getEventoId(context: RouteContext) {
  const params = await context.params;
  return params.eventoId?.trim();
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const eventoId = await getEventoId(context);
    if (!eventoId) {
      return NextResponse.json({ ok: false, error: "ID do evento não informado." }, { status: 400 });
    }

    const evento = await getEventoById(eventoId);
    if (!evento) {
      return NextResponse.json({ ok: false, error: "Evento não encontrado." }, { status: 404 });
    }

    const movimentacoes = await getMovimentacoesByEvento(eventoId);
    return NextResponse.json({
      ok: true,
      evento,
      movimentacoes,
      resumo: calculateFinancialSummary(movimentacoes),
    });
  } catch (error) {
    console.error("Erro ao consultar financeiro do evento:", error);
    return NextResponse.json({ ok: false, error: "Não foi possível carregar o financeiro." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const eventoId = await getEventoId(context);
    if (!eventoId) {
      return NextResponse.json({ ok: false, error: "ID do evento não informado." }, { status: 400 });
    }

    const evento = await getEventoById(eventoId);
    if (!evento) {
      return NextResponse.json({ ok: false, error: "Evento não encontrado." }, { status: 404 });
    }

    const body = (await request.json()) as Body;
    const date = requiredText(body, "date", "Data da movimentação");
    if (!validDate(date)) {
      return NextResponse.json({ ok: false, error: "Informe uma data válida." }, { status: 400 });
    }

    const movementId = `mov_${crypto.randomUUID()}`;
    const movimentacao = await createMovimento({
      id: movementId,
      eventoId,
      type: getType(body),
      description: requiredText(body, "description", "Descrição"),
      category: requiredText(body, "category", "Categoria"),
      amount: parseAmount(body),
      date,
      paymentMethod: optionalText(body, "paymentMethod"),
      responsible: optionalText(body, "responsible"),
      receiptUrl: optionalText(body, "receiptUrl"),
      status: getStatus(body),
      notes: optionalText(body, "notes"),
    });

    return NextResponse.json({ ok: true, message: "Movimentação criada com sucesso.", movimentacao }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível criar a movimentação.";
    console.error("Erro ao criar movimentação:", error);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}