import { NextResponse } from "next/server";

import {
  createEvento,
  getEventos,
} from "@/features/eventos/eventos-repository";

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

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function getStatus(
  body: Record<string, unknown>,
) {
  const status = optionalText(body, "status");

  if (
    status === "PLANNED" ||
    status === "IN_PROGRESS" ||
    status === "FINISHED" ||
    status === "CANCELLED"
  ) {
    return status;
  }

  return "PLANNED" as const;
}

export async function GET() {
  try {
    const eventos = await getEventos();

    return NextResponse.json({
      ok: true,
      eventos,
    });
  } catch (error) {
    console.error("Erro ao listar eventos:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os eventos.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<
      string,
      unknown
    >;

    const name = requiredText(body, "name", "Nome do evento");
    const edition = requiredText(body, "edition", "Edição");
    const startDate = requiredText(body, "startDate", "Data inicial");
    const endDate = requiredText(body, "endDate", "Data final");
    const location = requiredText(body, "location", "Local");
    const description = optionalText(body, "description");
    const status = getStatus(body);

    if (!validDate(startDate) || !validDate(endDate)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Informe datas válidas.",
        },
        { status: 400 },
      );
    }

    if (endDate < startDate) {
      return NextResponse.json(
        {
          ok: false,
          error: "A data final não pode ser anterior à data inicial.",
        },
        { status: 400 },
      );
    }

    const id = `evento_${crypto.randomUUID()}`;

    const evento = await createEvento({
      id,
      name,
      edition,
      startDate,
      endDate,
      location,
      description,
      status,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Evento criado com sucesso.",
        evento,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar evento:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível criar o evento.",
      },
      { status: 400 },
    );
  }
}