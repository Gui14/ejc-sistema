import { NextResponse } from "next/server";

import {
  deleteEvento,
  getEventoById,
  updateEvento,
} from "@/features/eventos/eventos-repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    eventoId: string;
  }>;
};

type Body = Record<string, unknown>;

function requiredText(
  body: Body,
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
  body: Body,
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

function getStatus(body: Body) {
  const status = optionalText(body, "status");

  if (
    status === "PLANNED" ||
    status === "IN_PROGRESS" ||
    status === "FINISHED" ||
    status === "CANCELLED"
  ) {
    return status;
  }

  throw new Error("Status do evento inválido.");
}

async function getId(context: RouteContext) {
  const params = await context.params;
  return params.eventoId?.trim();
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const id = await getId(context);

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          error: "ID do evento não informado.",
        },
        { status: 400 },
      );
    }

    const evento = await getEventoById(id);

    if (!evento) {
      return NextResponse.json(
        {
          ok: false,
          error: "Evento não encontrado.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      evento,
    });
  } catch (error) {
    console.error("Erro ao consultar evento:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível consultar o evento.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext,
) {
  try {
    const id = await getId(context);

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          error: "ID do evento não informado.",
        },
        { status: 400 },
      );
    }

    const body = (await request.json()) as Body;
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

    const evento = await updateEvento({
      id,
      name,
      edition,
      startDate,
      endDate,
      location,
      description,
      status,
    });

    return NextResponse.json({
      ok: true,
      message: "Evento atualizado com sucesso.",
      evento,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível atualizar o evento.";
    const status = message === "Evento não encontrado." ? 404 : 400;

    console.error("Erro ao atualizar evento:", error);

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
    const id = await getId(context);

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          error: "ID do evento não informado.",
        },
        { status: 400 },
      );
    }

    await deleteEvento(id);

    return NextResponse.json({
      ok: true,
      message: "Evento excluído com sucesso.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível excluir o evento.";
    const status = message === "Evento não encontrado." ? 404 : 400;

    console.error("Erro ao excluir evento:", error);

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}