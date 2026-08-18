import { NextResponse } from "next/server";

import {
  createEquipe,
  getEquipes,
} from "@/features/equipes/equipes-repository";

export const runtime = "nodejs";

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

function getStatus(
  body: Record<string, unknown>,
) {
  const value = optionalText(
    body,
    "status",
  );

  if (
    value !== "ACTIVE" &&
    value !== "INACTIVE"
  ) {
    return "ACTIVE" as const;
  }

  return value;
}

export async function GET() {
  try {
    const equipes = await getEquipes();

    return NextResponse.json({
      ok: true,
      equipes,
    });
  } catch (error) {
    console.error(
      "Erro ao listar equipes:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as equipes.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
) {
  try {
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

    const status = getStatus(body);

    const id =
      `equipe_${crypto.randomUUID()}`;

    const equipe = await createEquipe({
      id,
      name,
      description,
      status,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Equipe criada com sucesso.",
        equipe,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Erro ao criar equipe:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível criar a equipe.",
      },
      { status: 400 },
    );
  }
}