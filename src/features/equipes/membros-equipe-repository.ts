import {
  appendSheetRow,
  clearSheetCache,
  getSheetRows,
  updateSheetRow,
} from "@/lib/google/sheets";

const SHEET_NAME = "Membros_Equipe";

const COLUMNS = {
  id: 0,
  equipeId: 1,
  pessoaEquipeId: 2,
  encontreiroId: 3,
  role: 4,
  isCoordinator: 5,
  linkStatus: 6,
  createdAt: 7,
  updatedAt: 8,
} as const;

export type MembroEquipeStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "DELETED";

export type MembroEquipe = {
  rowNumber: number;
  id: string;
  equipeId: string;
  pessoaEquipeId: string;
  encontreiroId: string;
  role: string;
  isCoordinator: boolean;
  linkStatus: MembroEquipeStatus | string;
  createdAt: string;
  updatedAt: string;
};

type CreateMembroEquipeData = {
  id: string;
  equipeId: string;
  pessoaEquipeId: string;
  encontreiroId?: string;
  role: string;
  isCoordinator?: boolean;
  linkStatus?: MembroEquipeStatus;
};

type UpdateMembroEquipeData = {
  id: string;
  equipeId: string;
  pessoaEquipeId: string;
  encontreiroId: string;
  role: string;
  isCoordinator: boolean;
  linkStatus: MembroEquipeStatus;
};

function cell(
  row: string[],
  index: number,
) {
  return row[index] ?? "";
}

function parseBoolean(
  value: string,
) {
  return (
    value === "TRUE" ||
    value === "true" ||
    value === "1" ||
    value === "SIM"
  );
}

function mapRow(
  row: string[],
  rowNumber: number,
): MembroEquipe {
  return {
    rowNumber,
    id: cell(row, COLUMNS.id),
    equipeId: cell(
      row,
      COLUMNS.equipeId,
    ),
    pessoaEquipeId: cell(
      row,
      COLUMNS.pessoaEquipeId,
    ),
    encontreiroId: cell(
      row,
      COLUMNS.encontreiroId,
    ),
    role: cell(row, COLUMNS.role),
    isCoordinator: parseBoolean(
      cell(
        row,
        COLUMNS.isCoordinator,
      ),
    ),
    linkStatus: cell(
      row,
      COLUMNS.linkStatus,
    ),
    createdAt: cell(
      row,
      COLUMNS.createdAt,
    ),
    updatedAt: cell(
      row,
      COLUMNS.updatedAt,
    ),
  };
}

function isHeaderRow(
  row: string[],
) {
  return (
    row[COLUMNS.id] === "membro_id" ||
    row[COLUMNS.equipeId] === "equipe_id"
  );
}

function isVisible(
  membro: MembroEquipe,
) {
  return membro.linkStatus !== "DELETED";
}

export async function getMembrosEquipe() {
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

export async function getMembrosByEquipeId(
  equipeId: string,
) {
  const membros =
    await getMembrosEquipe();

  return membros.filter(
    (membro) =>
      membro.equipeId === equipeId,
  );
}

export async function getMembroEquipeById(
  id: string,
) {
  const rows = await getSheetRows(SHEET_NAME);

  const rowIndex = rows.findIndex(
    (row, index) =>
      index > 0 &&
      cell(row, COLUMNS.id) === id &&
      cell(
        row,
        COLUMNS.linkStatus,
      ) !== "DELETED",
  );

  if (rowIndex < 1) {
    return null;
  }

  return mapRow(
    rows[rowIndex],
    rowIndex + 1,
  );
}

export async function createMembroEquipe(
  data: CreateMembroEquipeData,
) {
  const now =
    new Date().toISOString();

  await appendSheetRow(SHEET_NAME, [
    data.id,
    data.equipeId,
    data.pessoaEquipeId,
    data.encontreiroId ?? "",
    data.role,
    data.isCoordinator ? "TRUE" : "FALSE",
    data.linkStatus ?? "ACTIVE",
    now,
    now,
  ]);

  clearSheetCache(SHEET_NAME);

  return getMembroEquipeById(
    data.id,
  );
}

export async function updateMembroEquipe(
  data: UpdateMembroEquipeData,
) {
  const current =
    await getMembroEquipeById(data.id);

  if (!current) {
    throw new Error(
      "Membro da equipe não encontrado.",
    );
  }

  const updatedAt =
    new Date().toISOString();

  const row: unknown[] = [
    data.id,
    data.equipeId,
    data.pessoaEquipeId,
    data.encontreiroId,
    data.role,
    data.isCoordinator ? "TRUE" : "FALSE",
    data.linkStatus,
    current.createdAt,
    updatedAt,
  ];

  await updateSheetRow(
    SHEET_NAME,
    current.rowNumber,
    row,
  );

  clearSheetCache(SHEET_NAME);

  return getMembroEquipeById(data.id);
}

export async function deleteMembroEquipe(
  id: string,
) {
  const current =
    await getMembroEquipeById(id);

  if (!current) {
    throw new Error(
      "Membro da equipe não encontrado.",
    );
  }

  const updatedAt =
    new Date().toISOString();

  const row: unknown[] = [
    current.id,
    current.equipeId,
    current.pessoaEquipeId,
    current.encontreiroId,
    current.role,
    current.isCoordinator
      ? "TRUE"
      : "FALSE",
    "DELETED",
    current.createdAt,
    updatedAt,
  ];

  await updateSheetRow(
    SHEET_NAME,
    current.rowNumber,
    row,
  );

  clearSheetCache(SHEET_NAME);

  return true;
}