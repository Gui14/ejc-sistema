import {
  appendSheetRow,
  clearSheetCache,
  getSheetRows,
  updateSheetRow,
} from "@/lib/google/sheets";

const SHEET_NAME = "Eventos";

const COLUMNS = {
  id: 0,
  name: 1,
  edition: 2,
  startDate: 3,
  endDate: 4,
  location: 5,
  description: 6,
  status: 7,
  createdAt: 8,
  updatedAt: 9,
} as const;

export type EventoStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "FINISHED"
  | "CANCELLED"
  | "DELETED";

export type Evento = {
  rowNumber: number;
  id: string;
  name: string;
  edition: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  status: EventoStatus | string;
  createdAt: string;
  updatedAt: string;
};

type CreateEventoData = {
  id: string;
  name: string;
  edition: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  status?: EventoStatus;
};

type UpdateEventoData = {
  id: string;
  name: string;
  edition: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  status: EventoStatus;
};

function cell(
  row: string[],
  index: number,
) {
  return row[index] ?? "";
}

function mapRow(
  row: string[],
  rowNumber: number,
): Evento {
  return {
    rowNumber,
    id: cell(row, COLUMNS.id),
    name: cell(row, COLUMNS.name),
    edition: cell(row, COLUMNS.edition),
    startDate: cell(row, COLUMNS.startDate),
    endDate: cell(row, COLUMNS.endDate),
    location: cell(row, COLUMNS.location),
    description: cell(row, COLUMNS.description),
    status: cell(row, COLUMNS.status),
    createdAt: cell(row, COLUMNS.createdAt),
    updatedAt: cell(row, COLUMNS.updatedAt),
  };
}

function isHeaderRow(
  row: string[],
) {
  return (
    row[COLUMNS.id] === "evento_id" ||
    row[COLUMNS.name] === "nome"
  );
}

function isVisible(evento: Evento) {
  return evento.status !== "DELETED";
}

export async function getEventos() {
  const rows = await getSheetRows(SHEET_NAME);

  return rows
    .map((row, index) => ({
      row,
      rowNumber: index + 1,
    }))
    .filter(({ row, rowNumber }) => {
      if (rowNumber === 1) {
        return false;
      }

      return !isHeaderRow(row);
    })
    .map(({ row, rowNumber }) =>
      mapRow(row, rowNumber),
    )
    .filter(isVisible);
}

export async function getEventoById(
  id: string,
) {
  const rows = await getSheetRows(SHEET_NAME);

  const rowIndex = rows.findIndex(
    (row, index) =>
      index > 0 &&
      cell(row, COLUMNS.id) === id &&
      cell(row, COLUMNS.status) !== "DELETED",
  );

  if (rowIndex < 1) {
    return null;
  }

  return mapRow(rows[rowIndex], rowIndex + 1);
}

export async function createEvento(
  data: CreateEventoData,
) {
  const now = new Date().toISOString();

  await appendSheetRow(SHEET_NAME, [
    data.id,
    data.name,
    data.edition,
    data.startDate,
    data.endDate,
    data.location,
    data.description,
    data.status ?? "PLANNED",
    now,
    now,
  ]);

  clearSheetCache(SHEET_NAME);

  return getEventoById(data.id);
}

export async function updateEvento(
  data: UpdateEventoData,
) {
  const current = await getEventoById(data.id);

  if (!current) {
    throw new Error("Evento não encontrado.");
  }

  const row: unknown[] = [
    data.id,
    data.name,
    data.edition,
    data.startDate,
    data.endDate,
    data.location,
    data.description,
    data.status,
    current.createdAt,
    new Date().toISOString(),
  ];

  await updateSheetRow(
    SHEET_NAME,
    current.rowNumber,
    row,
  );

  clearSheetCache(SHEET_NAME);

  return getEventoById(data.id);
}

export async function deleteEvento(
  id: string,
) {
  const current = await getEventoById(id);

  if (!current) {
    throw new Error("Evento não encontrado.");
  }

  const row: unknown[] = [
    current.id,
    current.name,
    current.edition,
    current.startDate,
    current.endDate,
    current.location,
    current.description,
    "DELETED",
    current.createdAt,
    new Date().toISOString(),
  ];

  await updateSheetRow(
    SHEET_NAME,
    current.rowNumber,
    row,
  );

  clearSheetCache(SHEET_NAME);

  return true;
}