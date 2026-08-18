import { NextResponse } from "next/server";

import {
  createPessoaEquipe,
  getPessoasEquipe,
} from "@/features/equipes/pessoas-equipe-repository";

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

export async function GET() {
  try {
    const pessoas =
      await getPessoasEquipe();

    return NextResponse.json({
      ok: true,
      pessoas,
    });
  } catch (error) {
    console.error(
      "Erro ao listar pessoas da equipe:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as pessoas.",
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

    const registeredById = optionalText(
      body,
      "registeredById",
    );

    const registeredByName = optionalText(
      body,
      "registeredByName",
    );

    const id =
      `pessoa_equipe_${crypto.randomUUID()}`;

    const pessoa =
      await createPessoaEquipe({
        id,
        name,
        whatsapp,
        email,
        observations,
        registeredById,
        registeredByName,
        registrationStatus:
          "WITHOUT_REGISTRATION",
      });

    return NextResponse.json(
      {
        ok: true,
        message:
          "Pessoa cadastrada com sucesso.",
        pessoa,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Erro ao criar pessoa da equipe:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar a pessoa.",
      },
      { status: 400 },
    );
  }
}