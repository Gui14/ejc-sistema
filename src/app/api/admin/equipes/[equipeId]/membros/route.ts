import { NextResponse } from "next/server";

import {
  createMembroEquipe,
  getMembrosByEquipeId,
} from "@/features/equipes/membros-equipe-repository";
import {
  getEquipeById,
} from "@/features/equipes/equipes-repository";
import {
  createPessoaEquipe,
  getPessoaEquipeById,
} from "@/features/equipes/pessoas-equipe-repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    equipeId: string;
  }>;
};

function requiredText(
  body: Record<string, unknown>,
  fieldName: string,
  label: string,
) {
  const value = body[fieldName];

  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `${label} é obrigatório.`,
    );
  }

  return value.trim();
}

function optionalText(
  body: Record<string, unknown>,
  fieldName: string,
) {
  const value = body[fieldName];

  return typeof value === "string"
    ? value.trim()
    : "";
}

function booleanValue(
  body: Record<string, unknown>,
  fieldName: string,
) {
  const value = body[fieldName];

  return value === true || value === "true";
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { equipeId } = await context.params;

    const equipe = await getEquipeById(equipeId);

    if (!equipe) {
      return NextResponse.json(
        {
          ok: false,
          error: "Equipe não encontrada.",
        },
        { status: 404 },
      );
    }

    const membros = await getMembrosByEquipeId(equipeId);

    return NextResponse.json({
      ok: true,
      membros,
    });
  } catch (error) {
    console.error("Erro ao listar membros:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os membros.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    const { equipeId } = await context.params;

    const equipe = await getEquipeById(equipeId);

    if (!equipe) {
      return NextResponse.json(
        {
          ok: false,
          error: "Equipe não encontrada.",
        },
        { status: 404 },
      );
    }

    const body = (await request.json()) as Record<
      string,
      unknown
    >;

    const createPerson =
      body.createPerson === true ||
      body.createPerson === "true";

    const role = requiredText(
      body,
      "role",
      "Função",
    );

    const isCoordinator = booleanValue(
      body,
      "isCoordinator",
    );

    let pessoaEquipeId: string;

    if (createPerson) {
      const name = requiredText(
        body,
        "name",
        "Nome completo",
      );

      const whatsapp = requiredText(
        body,
        "whatsapp",
        "WhatsApp",
      );

      const email = requiredText(
        body,
        "email",
        "E-mail",
      );

      const observations = optionalText(
        body,
        "observations",
      );

      pessoaEquipeId =
        `pessoa_equipe_${crypto.randomUUID()}`;

      const pessoa =
        await createPessoaEquipe({
          id: pessoaEquipeId,
          name,
          whatsapp,
          email,
          observations,
          registeredById: "ADMIN",
          registeredByName: "Administrador",
          registrationStatus:
            "WITHOUT_REGISTRATION",
        });

      if (!pessoa) {
        throw new Error(
          "Não foi possível criar a pessoa da equipe.",
        );
      }
    } else {
      pessoaEquipeId = requiredText(
        body,
        "pessoaEquipeId",
        "Pessoa da equipe",
      );

      const pessoa =
        await getPessoaEquipeById(
          pessoaEquipeId,
        );

      if (!pessoa) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Pessoa da equipe não encontrada.",
          },
          { status: 404 },
        );
      }
    }

    const id =
      `membro_${crypto.randomUUID()}`;

    const membro =
      await createMembroEquipe({
        id,
        equipeId,
        pessoaEquipeId,
        role,
        isCoordinator,
        linkStatus: "ACTIVE",
      });

    return NextResponse.json(
      {
        ok: true,
        message:
          "Pessoa adicionada à equipe com sucesso.",
        membro,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao adicionar membro:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível adicionar o membro.",
      },
      { status: 400 },
    );
  }
}