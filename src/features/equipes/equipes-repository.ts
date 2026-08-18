import {
  appendSheetRow,
  clearSheetCache,
  getSheetRows,
  updateSheetRow,
} from "@/lib/google/sheets";

import {
  getMembrosByEquipeId,
} from "@/features/equipes/membros-equipe-repository";

const SHEET_NAME = "Equipes";

const COLUMNS = {
  id: 0,
  name: 1,
  description: 2,
  status: 3,
  createdAt: 4,
  updatedAt: 5,
} as const;

export type EquipeStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "DELETED";

export type Equipe = {
  rowNumber: number;
  id: string;
  name: string;
  description: string;
  status: EquipeStatus | string;
  createdAt: string;
  updatedAt: string;
};

type CreateEquipeData = {
  id: string;
  name: string;
  description: string;
  status?: EquipeStatus;
};

type UpdateEquipeData = {
  id: string;
  name: string;
  description: string;
  status: EquipeStatus;
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
): Equipe {
  return {
    rowNumber,
    id: cell(row, COLUMNS.id),
    name: cell(row, COLUMNS.name),
    description: cell(
      row,
      COLUMNS.description,
    ),
    status: cell(
      row,
      COLUMNS.status,
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
    row[COLUMNS.id] === "equipe_id" ||
    row[COLUMNS.name] === "nome"
  );
}

function isVisible(
  equipe: Equipe,
) {
  return equipe.status !== "DELETED";
}

export async function getEquipesComQuantidadeDePessoas() {
  const equipes = await getEquipes();

  return Promise.all(
    equipes.map(async (equipe) => {
      const membros = await getMembrosByEquipeId(
        equipe.id,
      );

      return {
        ...equipe,
        quantidadePessoas: membros.length,
      };
    }),
  );
}

export async function getEquipes() {
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

export async function getEquipeById(
  id: string,
) {
  const rows = await getSheetRows(SHEET_NAME);

  const rowIndex = rows.findIndex(
    (row, index) =>
      index > 0 &&
      cell(row, COLUMNS.id) === id &&
      cell(
        row,
        COLUMNS.status,
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

export async function createEquipe(
  data: CreateEquipeData,
) {
  const now =
    new Date().toISOString();

  await appendSheetRow(SHEET_NAME, [
    data.id,
    data.name,
    data.description,
    data.status ?? "ACTIVE",
    now,
    now,
  ]);

  clearSheetCache(SHEET_NAME);

  return getEquipeById(data.id);
}

export async function updateEquipe(
  data: UpdateEquipeData,
) {
  const current =
    await getEquipeById(data.id);

  if (!current) {
    throw new Error(
      "Equipe não encontrada.",
    );
  }

  const updatedAt =
    new Date().toISOString();

  const row: unknown[] = [
    data.id,
    data.name,
    data.description,
    data.status,
    current.createdAt,
    updatedAt,
  ];

  await updateSheetRow(
    SHEET_NAME,
    current.rowNumber,
    row,
  );

  clearSheetCache(SHEET_NAME);

  return getEquipeById(data.id);
}

export async function deleteEquipe(
  id: string,
) {
  const current =
    await getEquipeById(id);

  if (!current) {
    throw new Error(
      "Equipe não encontrada.",
    );
  }

  const updatedAt =
    new Date().toISOString();

  const row: unknown[] = [
    current.id,
    current.name,
    current.description,
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