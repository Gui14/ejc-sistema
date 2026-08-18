import {
  appendSheetRow,
  clearSheetCache,
  getSheetRows,
  updateSheetRow,
} from "@/lib/google/sheets";

const SHEET_NAME = "Pessoas_Equipe";

const COLUMNS = {
  id: 0,
  name: 1,
  whatsapp: 2,
  email: 3,
  observations: 4,
  registeredById: 5,
  registeredByName: 6,
  registrationStatus: 7,
  createdAt: 8,
  updatedAt: 9,
} as const;

export type PessoaEquipeStatus =
  | "WITHOUT_REGISTRATION"
  | "PENDING"
  | "COMPLETED"
  | "DELETED";

export type PessoaEquipe = {
  rowNumber: number;
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  observations: string;
  registeredById: string;
  registeredByName: string;
  registrationStatus: PessoaEquipeStatus | string;
  createdAt: string;
  updatedAt: string;
};

type CreatePessoaEquipeData = {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  observations: string;
  registeredById: string;
  registeredByName: string;
  registrationStatus?: PessoaEquipeStatus;
};

type UpdatePessoaEquipeData = {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  observations: string;
  registeredById: string;
  registeredByName: string;
  registrationStatus: PessoaEquipeStatus;
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
): PessoaEquipe {
  return {
    rowNumber,
    id: cell(row, COLUMNS.id),
    name: cell(row, COLUMNS.name),
    whatsapp: cell(row, COLUMNS.whatsapp),
    email: cell(row, COLUMNS.email),
    observations: cell(
      row,
      COLUMNS.observations,
    ),
    registeredById: cell(
      row,
      COLUMNS.registeredById,
    ),
    registeredByName: cell(
      row,
      COLUMNS.registeredByName,
    ),
    registrationStatus: cell(
      row,
      COLUMNS.registrationStatus,
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
    row[COLUMNS.id] ===
      "pessoa_equipe_id" ||
    row[COLUMNS.name] ===
      "nome_completo"
  );
}

function isVisible(
  pessoa: PessoaEquipe,
) {
  return (
    pessoa.registrationStatus !==
    "DELETED"
  );
}

export async function getPessoasEquipe() {
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

export async function getPessoaEquipeById(
  id: string,
) {
  const rows = await getSheetRows(SHEET_NAME);

  const rowIndex = rows.findIndex(
    (row, index) =>
      index > 0 &&
      cell(row, COLUMNS.id) === id &&
      cell(
        row,
        COLUMNS.registrationStatus,
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

export async function createPessoaEquipe(
  data: CreatePessoaEquipeData,
) {
  const now =
    new Date().toISOString();

  await appendSheetRow(SHEET_NAME, [
    data.id,
    data.name,
    data.whatsapp,
    data.email,
    data.observations,
    data.registeredById,
    data.registeredByName,
    data.registrationStatus ??
      "WITHOUT_REGISTRATION",
    now,
    now,
  ]);

  clearSheetCache(SHEET_NAME);

  return getPessoaEquipeById(
    data.id,
  );
}

export async function updatePessoaEquipe(
  data: UpdatePessoaEquipeData,
) {
  const current =
    await getPessoaEquipeById(data.id);

  if (!current) {
    throw new Error(
      "Pessoa da equipe não encontrada.",
    );
  }

  const updatedAt =
    new Date().toISOString();

  const row: unknown[] = [
    data.id,
    data.name,
    data.whatsapp,
    data.email,
    data.observations,
    data.registeredById,
    data.registeredByName,
    data.registrationStatus,
    current.createdAt,
    updatedAt,
  ];

  await updateSheetRow(
    SHEET_NAME,
    current.rowNumber,
    row,
  );

  clearSheetCache(SHEET_NAME);

  return getPessoaEquipeById(data.id);
}

export async function deletePessoaEquipe(
  id: string,
) {
  const current =
    await getPessoaEquipeById(id);

  if (!current) {
    throw new Error(
      "Pessoa da equipe não encontrada.",
    );
  }

  const updatedAt =
    new Date().toISOString();

  const row: unknown[] = [
    current.id,
    current.name,
    current.whatsapp,
    current.email,
    current.observations,
    current.registeredById,
    current.registeredByName,
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