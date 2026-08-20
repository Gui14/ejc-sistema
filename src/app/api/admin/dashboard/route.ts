import { NextResponse } from "next/server";

import { getSheetRows } from "@/lib/google/sheets";
import {
  getEquipesComQuantidadeDePessoas,
  type EquipeComResumo,
} from "@/features/equipes/equipes-repository";

export const runtime = "nodejs";

type SheetRow = string[];
type SheetTable = { headers: string[]; rows: SheetRow[] };

const SHEETS = {
  inscricoes: "Inscricoes",
  convidados: "Convidados",
  padrinhos: "Padrinhos",
  encontreiros: "Encontreiros",
  equipes: "Equipes",
} as const;

function normalize(value: unknown) {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
}

function createTable(rows: SheetRow[]): SheetTable {
  return {
    headers: (rows[0] ?? []).map(normalize),
    rows: rows.slice(1).filter((row) => row.some((cell) => String(cell ?? "").trim() !== "")),
  };
}

function cell(table: SheetTable, row: SheetRow, names: string[]) {
  const index = table.headers.findIndex((header) => names.map(normalize).includes(header));
  return index >= 0 ? String(row[index] ?? "").trim() : "";
}

function filterByEvent(table: SheetTable, rows: SheetRow[], eventoId: string) {
  if (!eventoId) return rows;
  return rows.filter((row) => ["evento_id", "grupo_inscricao_id", "grupo_id"].some((name) => cell(table, row, [name]) === eventoId));
}

function countByValue(table: SheetTable, rows: SheetRow[], names: string[], expected: string) {
  return rows.filter((row) => normalize(cell(table, row, names)) === normalize(expected)).length;
}

function uniqueValues(table: SheetTable, rows: SheetRow[], names: string[]) {
  const values = new Map<string, string>();
  for (const row of rows) {
    const current = cell(table, row, names);
    if (current && !values.has(normalize(current))) values.set(normalize(current), current);
  }
  return Array.from(values.values());
}

function mapTeam(team: EquipeComResumo) {
  return {
    id: team.id,
    name: team.name,
    status: team.status,
    allocatedCount: team.quantidadePessoas,
    coordinators: team.coordenadores.map((coordinator) => ({
      id: coordinator.id,
      name: coordinator.name,
      phone: coordinator.phone,
    })),
    openSlots: 0,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const eventoId = url.searchParams.get("eventoId")?.trim() ?? "";

    const [inscricoesRaw, convidadosRaw, padrinhosRaw, encontreirosRaw, equipesResumo, equipesRaw] = await Promise.all([
      getSheetRows(SHEETS.inscricoes),
      getSheetRows(SHEETS.convidados),
      getSheetRows(SHEETS.padrinhos),
      getSheetRows(SHEETS.encontreiros),
      getEquipesComQuantidadeDePessoas(),
      getSheetRows(SHEETS.equipes),
    ]);

    const inscricoes = createTable(inscricoesRaw);
    const convidados = createTable(convidadosRaw);
    const padrinhos = createTable(padrinhosRaw);
    const encontreiros = createTable(encontreirosRaw);
    const equipes = createTable(equipesRaw);

    const inscricoesRows = filterByEvent(inscricoes, inscricoes.rows, eventoId);
    const convidadosRows = filterByEvent(convidados, convidados.rows, eventoId);
    const padrinhosRows = filterByEvent(padrinhos, padrinhos.rows, eventoId);
    const encontreirosRows = filterByEvent(encontreiros, encontreiros.rows, eventoId);
    const equipesRows = filterByEvent(equipes, equipes.rows, eventoId);

    const teams = equipesResumo.map(mapTeam);
    const filteredTeams = eventoId
      ? teams.filter((team) => equipesRows.some((row) => cell(equipes, row, ["equipe_id", "grupo_id"]) === team.id))
      : teams;

    const sponsorNames = uniqueValues(convidados, convidadosRows, ["nome_pais_adotivos", "sponsor_name"]);
    const documentsPending = convidadosRows.filter((row) => !cell(convidados, row, ["foto_convidado_drive_url", "person_photo_url"]) || !cell(convidados, row, ["foto_rg_drive_url", "rg_photo_url"])).length;
    const enrolledWithTeam = encontreirosRows.filter((row) => cell(encontreiros, row, ["equipe_id", "equipe", "team_id"])).length;

    return NextResponse.json({
      ok: true,
      filtro: { eventoId: eventoId || null },
      encontristas: {
        totalInscricoes: inscricoesRows.length,
        totalConvidados: convidadosRows.length,
        totalPaisAdotivos: sponsorNames.length,
        totalPadrinhos: padrinhosRows.length,
        pendencias: countByValue(inscricoes, inscricoesRows, ["pix_status"], "PENDING_REVIEW"),
        inscricoesAprovadas: countByValue(inscricoes, inscricoesRows, ["pix_status"], "APPROVED"),
        complementacoesConcluidas: countByValue(convidados, convidadosRows, ["status_complementacao", "completion_status"], "COMPLETED"),
        documentosPendentes: documentsPending,
        convidadosSemPaiAdotivo: convidadosRows.filter((row) => !cell(convidados, row, ["nome_pais_adotivos", "sponsor_name"])).length,
      },
      encontreiros: {
        total: encontreirosRows.length,
        ativos: countByValue(encontreiros, encontreirosRows, ["status", "status_registro"], "ACTIVE"),
        inativos: countByValue(encontreiros, encontreirosRows, ["status", "status_registro"], "INACTIVE"),
        comEquipe: enrolledWithTeam,
        semEquipe: encontreirosRows.length - enrolledWithTeam,
      },
      equipes: {
        total: filteredTeams.length,
        ativas: filteredTeams.filter((team) => normalize(team.status) === "active").length,
        alocados: filteredTeams.reduce((total, team) => total + team.allocatedCount, 0),
        semResponsavel: filteredTeams.filter((team) => team.coordinators.length === 0).length,
        vagasAbertas: filteredTeams.filter((team) => (team.openSlots ?? 0) > 0).length,
        lista: filteredTeams,
      },
    });
  } catch (error) {
    console.error("Erro ao carregar resumo do dashboard:", error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Não foi possível carregar o resumo." }, { status: 500 });
  }
}