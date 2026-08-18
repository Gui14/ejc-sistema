import {
  appendSheetRow,
  clearSheetCache,
  getSheetRows,
  updateSheetRow,
} from "@/lib/google/sheets";

const SHEET_NAME = "Movimentacoes_Financeiras";

const COLUMNS = {
  id: 0,
  eventoId: 1,
  type: 2,
  description: 3,
  category: 4,
  amount: 5,
  date: 6,
  paymentMethod: 7,
  responsible: 8,
  receiptUrl: 9,
  status: 10,
  notes: 11,
  createdAt: 12,
  updatedAt: 13,
} as const;

export type MovementType = "ENTRADA" | "SAIDA";
export type MovementStatus = "PENDENTE" | "CONFIRMADO" | "CANCELADO" | "DELETED";

export type MovimentoFinanceiro = {
  rowNumber: number;
  id: string;
  eventoId: string;
  type: MovementType | string;
  description: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  responsible: string;
  receiptUrl: string;
  status: MovementStatus | string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type CreateMovimentoData = Omit<MovimentoFinanceiro, "rowNumber" | "amount" | "createdAt" | "updatedAt"> & {
  amount: number;
};

type UpdateMovimentoData = Omit<CreateMovimentoData, "id" | "eventoId"> & {
  id: string;
  eventoId: string;
};

function cell(row: string[], index: number) {
  return row[index] ?? "";
}

function parseAmount(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function mapRow(row: string[], rowNumber: number): MovimentoFinanceiro {
  return {
    rowNumber,
    id: cell(row, COLUMNS.id),
    eventoId: cell(row, COLUMNS.eventoId),
    type: cell(row, COLUMNS.type),
    description: cell(row, COLUMNS.description),
    category: cell(row, COLUMNS.category),
    amount: parseAmount(cell(row, COLUMNS.amount)),
    date: cell(row, COLUMNS.date),
    paymentMethod: cell(row, COLUMNS.paymentMethod),
    responsible: cell(row, COLUMNS.responsible),
    receiptUrl: cell(row, COLUMNS.receiptUrl),
    status: cell(row, COLUMNS.status),
    notes: cell(row, COLUMNS.notes),
    createdAt: cell(row, COLUMNS.createdAt),
    updatedAt: cell(row, COLUMNS.updatedAt),
  };
}

function isHeaderRow(row: string[]) {
  return row[COLUMNS.id] === "movimentacao_id" || row[COLUMNS.eventoId] === "evento_id";
}

function isVisible(movement: MovimentoFinanceiro) {
  return movement.status !== "DELETED";
}

export async function getMovimentacoesByEvento(eventoId: string) {
  const rows = await getSheetRows(SHEET_NAME);

  return rows
    .map((row, index) => ({ row, rowNumber: index + 1 }))
    .filter(({ row, rowNumber }) => rowNumber !== 1 && !isHeaderRow(row))
    .map(({ row, rowNumber }) => mapRow(row, rowNumber))
    .filter((movement) => movement.eventoId === eventoId && isVisible(movement));
}

export async function getMovimentoById(id: string) {
  const rows = await getSheetRows(SHEET_NAME);
  const rowIndex = rows.findIndex(
    (row, index) => index > 0 && cell(row, COLUMNS.id) === id && cell(row, COLUMNS.status) !== "DELETED",
  );

  return rowIndex < 1 ? null : mapRow(rows[rowIndex], rowIndex + 1);
}

export async function createMovimento(data: CreateMovimentoData) {
  const now = new Date().toISOString();

  await appendSheetRow(SHEET_NAME, [
    data.id,
    data.eventoId,
    data.type,
    data.description,
    data.category,
    data.amount,
    data.date,
    data.paymentMethod,
    data.responsible,
    data.receiptUrl,
    data.status,
    data.notes,
    now,
    now,
  ]);

  clearSheetCache(SHEET_NAME);
  return getMovimentoById(data.id);
}

export async function updateMovimento(data: UpdateMovimentoData) {
  const current = await getMovimentoById(data.id);
  if (!current) throw new Error("Movimentação não encontrada.");

  await updateSheetRow(SHEET_NAME, current.rowNumber, [
    data.id,
    data.eventoId,
    data.type,
    data.description,
    data.category,
    data.amount,
    data.date,
    data.paymentMethod,
    data.responsible,
    data.receiptUrl,
    data.status,
    data.notes,
    current.createdAt,
    new Date().toISOString(),
  ]);

  clearSheetCache(SHEET_NAME);
  return getMovimentoById(data.id);
}

export async function deleteMovimento(id: string) {
  const current = await getMovimentoById(id);
  if (!current) throw new Error("Movimentação não encontrada.");

  await updateSheetRow(SHEET_NAME, current.rowNumber, [
    current.id,
    current.eventoId,
    current.type,
    current.description,
    current.category,
    current.amount,
    current.date,
    current.paymentMethod,
    current.responsible,
    current.receiptUrl,
    "DELETED",
    current.notes,
    current.createdAt,
    new Date().toISOString(),
  ]);

  clearSheetCache(SHEET_NAME);
  return true;
}

export function calculateFinancialSummary(movements: MovimentoFinanceiro[]) {
  const confirmed = movements.filter((movement) => movement.status === "CONFIRMADO");
  const receitas = confirmed
    .filter((movement) => movement.type === "ENTRADA")
    .reduce((total, movement) => total + movement.amount, 0);
  const despesas = confirmed
    .filter((movement) => movement.type === "SAIDA")
    .reduce((total, movement) => total + movement.amount, 0);

  return {
    receitas,
    despesas,
    saldo: receitas - despesas,
    pendentes: movements.filter((movement) => movement.status === "PENDENTE").length,
  };
}