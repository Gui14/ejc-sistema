import { NextResponse } from "next/server";
import {
  getEquipes,
} from "@/features/equipes/equipes-repository";
import {
  getMembrosByEquipeId,
} from "@/features/equipes/membros-equipe-repository";
import {
  getPessoasEquipe,
} from "@/features/equipes/pessoas-equipe-repository";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderRows(
  rows: {
    name: string;
    email: string;
    whatsapp: string;
  }[],
) {
  if (!rows.length) {
    return `
      <tr>
        <td colspan="3" class="empty">Nenhuma pessoa cadastrada nesta equipe.</td>
      </tr>
    `;
  }

  return rows
    .map(
      (row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(row.name || "—")}</td>
          <td>${escapeHtml(row.email || "—")}</td>
          <td>${escapeHtml(row.whatsapp || "—")}</td>
        </tr>
      `,
    )
    .join("");
}

export async function GET() {
  try {
    const [equipes, pessoas] = await Promise.all([
      getEquipes(),
      getPessoasEquipe(),
    ]);

    const pessoasMap = new Map(
      pessoas.map((pessoa) => [pessoa.id, pessoa]),
    );

    const pages = await Promise.all(
      equipes.map(async (equipe) => {
        const membros = await getMembrosByEquipeId(
          equipe.id,
        );

        const rows = membros.map((membro) => {
          const pessoa = pessoasMap.get(
            membro.pessoaEquipeId,
          );

          return {
            name: pessoa?.name ?? "Pessoa não encontrada",
            email: pessoa?.email ?? "",
            whatsapp: pessoa?.whatsapp ?? "",
          };
        });

        return `
          <section class="team-page">
            <div class="header">
              <p class="eyebrow">EJC — Organização de equipes</p>
              <h1>${escapeHtml(equipe.name)}</h1>
              <p class="count">${rows.length} pessoa${rows.length === 1 ? "" : "s"}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome completo</th>
                  <th>E-mail</th>
                  <th>WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                ${renderRows(rows)}
              </tbody>
            </table>
          </section>
        `;
      }),
    );

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Equipes</title>
  <style>
    @page {
      size: A4;
      margin: 18mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: #172033;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
    }

    .team-page {
      min-height: 245mm;
      page-break-after: always;
      break-after: page;
    }

    .team-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .header {
      border-bottom: 2px solid #172033;
      margin-bottom: 18px;
      padding-bottom: 12px;
    }

    .eyebrow {
      color: #667085;
      font-size: 9px;
      font-weight: bold;
      letter-spacing: 1.5px;
      margin: 0 0 10px;
      text-transform: uppercase;
    }

    h1 {
      font-size: 24px;
      margin: 0;
    }

    .count {
      color: #667085;
      font-size: 12px;
      margin: 7px 0 0;
    }

    table {
      border-collapse: collapse;
      width: 100%;
    }

    th {
      background: #172033;
      color: #ffffff;
      font-size: 10px;
      padding: 9px 8px;
      text-align: left;
    }

    td {
      border-bottom: 1px solid #d9dee8;
      padding: 9px 8px;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background: #f5f7fa;
    }

    .empty {
      color: #667085;
      padding: 18px 8px;
      text-align: center;
    }
  </style>
</head>
<body>
  ${pages.join("")}
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'inline; filename="equipes.html"',
      },
    });
  } catch (error) {
    console.error(
      "Erro ao exportar equipes:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível exportar as equipes.",
      },
      { status: 500 },
    );
  }
}