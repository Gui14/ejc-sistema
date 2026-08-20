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

export type EquipeStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type Equipe = {
  rowNumber: number;
  id: string;
  name: string;
  description: string;
  status: EquipeStatus | string;
  createdAt: string;
  updatedAt: string;
};

export type EquipeCoordenador = {
  id: string;
  name: string;
  phone?: string;
};

export type EquipeComResumo = Equipe & {
  quantidadePessoas: number;
  quantidadeCoordenadores: number;
  coordenadores: EquipeCoordenador[];
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

function cell(row: string[], index: number) {
  return row[index] ?? "";
}

function mapRow(row: string[], rowNumber: number): Equipe {
  return {
    rowNumber,
    id: cell(row, COLUMNS.id),
    name: cell(row, COLUMNS.name),
    description: cell(row, COLUMNS.description),
    status: cell(row, COLUMNS.status),
    createdAt: cell(row, COLUMNS.createdAt),
    updatedAt: cell(row, COLUMNS.updatedAt),
  };
}

function isHeaderRow(row: string[]) {
  return row[COLUMNS.id] === "equipe_id" || row[COLUMNS.name] === "nome";
}

function isVisible(equipe: Equipe) {
  return equipe.status !== "DELETED";
}

function getCoordinatorName(value: unknown) {
  return String(value ?? "").trim();
}

function getCoordinatorId(value: unknown, index: number) {
  const id = String(value ?? "").trim();
  return id || `coordenador_${index + 1}`;
}

function parseCoordinatorValue(value: unknown): EquipeCoordenador[] {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (typeof item === "string") {
          const name = item.trim();
          return name ? { id: getCoordinatorId("", index), name } : null;
        }

        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const name = getCoordinatorName(record.name ?? record.nome);
          return name
            ? {
                id: getCoordinatorId(record.id ?? record.coordenador_id, index),
                name,
                phone: getCoordinatorName(record.phone ?? record.whatsapp) || undefined,
              }
            : null;
        }

        return null;
      })
      .filter((item): item is EquipeCoordenador => item !== null);
  }

  return String(value ?? "")
    .split(/[,;\n]/)
    .map((name, index) => name.trim())
    .filter(Boolean)
    .map((name, index) => ({
      id: `coordenador_${index + 1}`,
      name,
    }));
}

function getCoordinatorsFromEquipe(equipe: Equipe): EquipeCoordenador[] {
  const possibleValue = (equipe as Equipe & {
    coordinators?: unknown;
    coordenadores?: unknown;
    coordinatorNames?: unknown;
    coordenadorNome?: unknown;
  }).coordinators ?? (equipe as Equipe & { coordenadores?: unknown }).coordenadores ?? (equipe as Equipe & { coordinatorNames?: unknown }).coordinatorNames ?? (equipe as Equipe & { coordenadorNome?: unknown }).coordenadorNome;

  return parseCoordinatorValue(possibleValue);
}

export async function getEquipes() {
  const rows = await getSheetRows(SHEET_NAME);

  return rows
    .map((row, index) => ({ row, rowNumber: index + 1 }))
    .filter(({ row, rowNumber }) => rowNumber !== 1 && !isHeaderRow(row))
    .map(({ row, rowNumber }) => mapRow(row, rowNumber))
    .filter(isVisible);
}

export async function getEquipesComQuantidadeDePessoas(): Promise<EquipeComResumo[]> {
  const equipes = await getEquipes();

  return Promise.all(
    equipes.map(async (equipe) => {
      const membros = await getMembrosByEquipeId(equipe.id);
      const coordenadores = getCoordinatorsFromEquipe(equipe);

      return {
        ...equipe,
        quantidadePessoas: membros.length,
        quantidadeCoordenadores: coordenadores.length,
        coordenadores,
      };
    }),
  );
}

export async function getEquipeById(id: string) {
  const rows = await getSheetRows(SHEET_NAME);

  const rowIndex = rows.findIndex(
    (row, index) => index > 0 && cell(row, COLUMNS.id) === id && cell(row, COLUMNS.status) !== "DELETED",
  );

  if (rowIndex < 1) return null;
  return mapRow(rows[rowIndex], rowIndex + 1);
}

export async function createEquipe(data: CreateEquipeData) {
  const now = new Date().toISOString();

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

export async function updateEquipe(data: UpdateEquipeData) {
  const current = await getEquipeById(data.id);
  if (!current) throw new Error("Equipe não encontrada.");

  await updateSheetRow(SHEET_NAME, current.rowNumber, [
    data.id,
    data.name,
    data.description,
    data.status,
    current.createdAt,
    new Date().toISOString(),
  ]);

  clearSheetCache(SHEET_NAME);
  return getEquipeById(data.id);
}

export async function deleteEquipe(id: string) {
  const current = await getEquipeById(id);
  if (!current) throw new Error("Equipe não encontrada.");

  await updateSheetRow(SHEET_NAME, current.rowNumber, [
    current.id,
    current.name,
    current.description,
    "DELETED",
    current.createdAt,
    new Date().toISOString(),
  ]);

  clearSheetCache(SHEET_NAME);
  return true;
}