import {
  appendSheetRow,
  clearSheetCache,
  getSheetRows,
  updateSheetRow,
} from "@/lib/google/sheets";

const SHEET_NAME = "Encontreiros";

const COLUMNS = {
  id: 0,
  name: 1,
  whatsapp: 2,
  email: 3,
  birthDate: 4,
  sex: 5,
  church: 6,
  otherChurch: 7,
  city: 8,
  otherCity: 9,
  observations: 10,
  pixReceiptUrl: 11,
  pixStatus: 12,
  adminObservation: 13,
  recordStatus: 14,
  createdAt: 15,
  updatedAt: 16,
} as const;

export type PixStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type Encontreiro = {
  rowNumber: number;
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  birthDate: string;
  sex: string;
  church: string;
  otherChurch: string;
  city: string;
  otherCity: string;
  observations: string;
  pixReceiptUrl: string;
  pixStatus: PixStatus | string;
  adminObservation: string;
  recordStatus: string;
  createdAt: string;
  updatedAt: string;
};

type CreateEncontreiroData = {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  birthDate: string;
  sex: string;
  church: string;
  otherChurch: string;
  city: string;
  otherCity: string;
  observations: string;
  pixReceiptUrl: string;
  pixStatus: PixStatus;
  adminObservation: string;
};

type UpdateEncontreiroData = {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  birthDate: string;
  sex: string;
  church: string;
  otherChurch: string;
  city: string;
  otherCity: string;
  observations: string;
  pixReceiptUrl: string;
  pixStatus: PixStatus;
  adminObservation: string;
  recordStatus?: string;
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
): Encontreiro {
  return {
    rowNumber,
    id: cell(row, COLUMNS.id),
    name: cell(row, COLUMNS.name),
    whatsapp: cell(
      row,
      COLUMNS.whatsapp,
    ),
    email: cell(row, COLUMNS.email),
    birthDate: cell(
      row,
      COLUMNS.birthDate,
    ),
    sex: cell(row, COLUMNS.sex),
    church: cell(
      row,
      COLUMNS.church,
    ),
    otherChurch: cell(
      row,
      COLUMNS.otherChurch,
    ),
    city: cell(row, COLUMNS.city),
    otherCity: cell(
      row,
      COLUMNS.otherCity,
    ),
    observations: cell(
      row,
      COLUMNS.observations,
    ),
    pixReceiptUrl: cell(
      row,
      COLUMNS.pixReceiptUrl,
    ),
    pixStatus: cell(
      row,
      COLUMNS.pixStatus,
    ),
    adminObservation: cell(
      row,
      COLUMNS.adminObservation,
    ),
    recordStatus: cell(
      row,
      COLUMNS.recordStatus,
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
      "encontreiro_id" ||
    row[COLUMNS.name] ===
      "nome_completo"
  );
}

function isActive(
  encontreiro: Encontreiro,
) {
  return encontreiro.recordStatus !== "DELETED";
}

export async function getEncontreiros() {
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
    .filter(isActive);
}

export async function getEncontreiroById(
  id: string,
) {
  const rows = await getSheetRows(SHEET_NAME);

  const rowIndex = rows.findIndex(
    (row, index) =>
      index > 0 &&
      cell(row, COLUMNS.id) === id &&
      cell(
        row,
        COLUMNS.recordStatus,
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

export async function createEncontreiro(
  data: CreateEncontreiroData,
) {
  const now =
    new Date().toISOString();

  await appendSheetRow(SHEET_NAME, [
    data.id,
    data.name,
    data.whatsapp,
    data.email,
    data.birthDate,
    data.sex,
    data.church,
    data.otherChurch,
    data.city,
    data.otherCity,
    data.observations,
    data.pixReceiptUrl,
    data.pixStatus,
    data.adminObservation,
    "ACTIVE",
    now,
    now,
  ]);

  clearSheetCache(SHEET_NAME);

  return getEncontreiroById(
    data.id,
  );
}

export async function updateEncontreiro(
  data: UpdateEncontreiroData,
) {
  const current =
    await getEncontreiroById(data.id);

  if (!current) {
    throw new Error(
      "Encontreiro não encontrado.",
    );
  }

  const updatedAt =
    new Date().toISOString();

  const row: unknown[] = [
    data.id,
    data.name,
    data.whatsapp,
    data.email,
    data.birthDate,
    data.sex,
    data.church,
    data.otherChurch,
    data.city,
    data.otherCity,
    data.observations,
    data.pixReceiptUrl,
    data.pixStatus,
    data.adminObservation,
    data.recordStatus ??
      current.recordStatus,
    current.createdAt,
    updatedAt,
  ];

  await updateSheetRow(
    SHEET_NAME,
    current.rowNumber,
    row,
  );

  clearSheetCache(SHEET_NAME);

  return getEncontreiroById(data.id);
}

export async function updateEncontreiroPix(
  data: {
    id: string;
    pixStatus: PixStatus;
    adminObservation: string;
  },
) {
  const current =
    await getEncontreiroById(data.id);

  if (!current) {
    throw new Error(
      "Encontreiro não encontrado.",
    );
  }

  const updatedAt =
    new Date().toISOString();

  const row: unknown[] = [
    current.id,
    current.name,
    current.whatsapp,
    current.email,
    current.birthDate,
    current.sex,
    current.church,
    current.otherChurch,
    current.city,
    current.otherCity,
    current.observations,
    current.pixReceiptUrl,
    data.pixStatus,
    data.adminObservation,
    current.recordStatus,
    current.createdAt,
    updatedAt,
  ];

  await updateSheetRow(
    SHEET_NAME,
    current.rowNumber,
    row,
  );

  clearSheetCache(SHEET_NAME);

  return getEncontreiroById(data.id);
}