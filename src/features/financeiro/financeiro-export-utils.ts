import type { MovimentoFinanceiro } from "@/features/financeiro/movimentacoes-repository";

function csvValue(value: string | number) {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function buildMovimentacoesCsv(movements: MovimentoFinanceiro[]) {
  const headers = [
    "movimentacao_id",
    "evento_id",
    "tipo",
    "descricao",
    "categoria",
    "valor",
    "data_movimentacao",
    "forma_pagamento",
    "responsavel",
    "status",
    "observacoes",
  ];

  const lines = movements.map((movement) => [
    movement.id,
    movement.eventoId,
    movement.type,
    movement.description,
    movement.category,
    movement.amount.toFixed(2).replace(".", ","),
    movement.date,
    movement.paymentMethod,
    movement.responsible,
    movement.status,
    movement.notes,
  ].map(csvValue).join(";"));

  return [headers.map(csvValue).join(";"), ...lines].join("\n");
}