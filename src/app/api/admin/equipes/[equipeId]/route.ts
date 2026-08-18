import { NextResponse } from "next/server";

import {
  deleteEquipe,
  getEquipeById,
  updateEquipe,
  type EquipeStatus,
} from "@/features/equipes/equipes-repository";

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

function parseStatus(
  body: Record<string, unknown>,
): EquipeStatus {
  const status = optionalText(
    body,
    "status",
  );

  if (
    status === "ACTIVE" ||
    status === "INACTIVE"
  ) {
    return status;
  }

  throw new Error(
    "Status da equipe inválido.",
  );
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { equipeId } =
      await context.params;

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

    return NextResponse.json({
      ok: true,
      equipe,
    });
  } catch (error) {
    console.error(
      "Erro ao carregar equipe:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a equipe.",
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
    const { equipeId } =
      await context.params;

    const body = (await request.json()) as Record<
      string,
      unknown
    >;

    const name = requiredText(
      body,
      "name",
      "Nome da equipe",
    );

    const description = optionalText(
      body,
      "description",
    );

    const status = parseStatus(body);

    const equipe =
      await updateEquipe({
        id: equipeId,
        name,
        description,
        status,
      });

    return NextResponse.json({
      ok: true,
      message: "Equipe atualizada com sucesso.",
      equipe,
    });
  } catch (error) {
    console.error(
      "Erro ao atualizar equipe:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível atualizar a equipe.";

    const status =
      message === "Equipe não encontrada."
        ? 404
        : 400;

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { equipeId } =
      await context.params;

    await deleteEquipe(equipeId);

    return NextResponse.json({
      ok: true,
      message: "Equipe excluída com sucesso.",
    });
  } catch (error) {
    console.error(
      "Erro ao excluir equipe:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível excluir a equipe.";

    const status =
      message === "Equipe não encontrada."
        ? 404
        : 400;

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}