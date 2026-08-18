import { NextResponse } from "next/server";

import {
  deleteMembroEquipe,
  getMembroEquipeById,
  updateMembroEquipe,
} from "@/features/equipes/membros-equipe-repository";
import {
  getEquipeById,
} from "@/features/equipes/equipes-repository";
import {
  getPessoaEquipeById,
} from "@/features/equipes/pessoas-equipe-repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    equipeId: string;
    membroId: string;
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

function parseStatus(
  body: Record<string, unknown>,
) {
  const value = optionalText(
    body,
    "linkStatus",
  );

  if (
    value !== "ACTIVE" &&
    value !== "INACTIVE"
  ) {
    throw new Error(
      "Status do vínculo inválido.",
    );
  }

  return value as "ACTIVE" | "INACTIVE";
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const {
      equipeId,
      membroId,
    } = await context.params;

    const equipe =
      await getEquipeById(equipeId);

    if (!equipe) {
      return NextResponse.json(
        {
          ok: false,
          error: "Equipe não encontrada.",
        },
        { status: 404 },
      );
    }

    const membro =
      await getMembroEquipeById(membroId);

    if (
      !membro ||
      membro.equipeId !== equipeId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Membro não encontrado nesta equipe.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      membro,
    });
  } catch (error) {
    console.error(
      "Erro ao carregar membro:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o membro.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const {
      equipeId,
      membroId,
    } = await context.params;

    const equipe =
      await getEquipeById(equipeId);

    if (!equipe) {
      return NextResponse.json(
        {
          ok: false,
          error: "Equipe não encontrada.",
        },
        { status: 404 },
      );
    }

    const membro =
      await getMembroEquipeById(membroId);

    if (
      !membro ||
      membro.equipeId !== equipeId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Membro não encontrado nesta equipe.",
        },
        { status: 404 },
      );
    }

    const body = (await request.json()) as Record<
      string,
      unknown
    >;

    const pessoaEquipeId = requiredText(
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

    const role = requiredText(
      body,
      "role",
      "Função",
    );

    const encontreiroId = optionalText(
      body,
      "encontreiroId",
    );

    const isCoordinator = booleanValue(
      body,
      "isCoordinator",
    );

    const linkStatus = parseStatus(body);

    const updated =
      await updateMembroEquipe({
        id: membroId,
        equipeId,
        pessoaEquipeId,
        encontreiroId,
        role,
        isCoordinator,
        linkStatus,
      });

    return NextResponse.json({
      ok: true,
      message:
        "Membro atualizado com sucesso.",
      membro: updated,
    });
  } catch (error) {
    console.error(
      "Erro ao atualizar membro:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o membro.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const {
      equipeId,
      membroId,
    } = await context.params;

    const equipe =
      await getEquipeById(equipeId);

    if (!equipe) {
      return NextResponse.json(
        {
          ok: false,
          error: "Equipe não encontrada.",
        },
        { status: 404 },
      );
    }

    const membro =
      await getMembroEquipeById(membroId);

    if (
      !membro ||
      membro.equipeId !== equipeId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Membro não encontrado nesta equipe.",
        },
        { status: 404 },
      );
    }

    await deleteMembroEquipe(membroId);

    return NextResponse.json({
      ok: true,
      message:
        "Membro removido da equipe.",
    });
  } catch (error) {
    console.error(
      "Erro ao remover membro:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível remover o membro.",
      },
      { status: 400 },
    );
  }
}