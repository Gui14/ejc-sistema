import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/admin-session";
import {
  getAdminGroupDetails,
  updateRegistrationGroup,
} from "@/features/admin/admin-repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    groupId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: "Não autenticado.",
      },
      { status: 401 },
    );
  }

  try {
    const { groupId } = await context.params;
    const details = await getAdminGroupDetails(groupId);

    if (!details) {
      return NextResponse.json(
        {
          ok: false,
          error: "Inscrição não encontrada.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      details,
    });
  } catch (error) {
    console.error("Erro ao carregar edição:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível carregar a inscrição.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: "Não autenticado.",
      },
      { status: 401 },
    );
  }

  try {
    const { groupId } = await context.params;
    const body = await request.json();

    const updated = await updateRegistrationGroup(
      groupId,
      body,
    );

    return NextResponse.json({
      ok: true,
      details: updated,
    });
  } catch (error) {
    console.error("Erro ao atualizar inscrição:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível atualizar a inscrição.",
      },
      { status: 500 },
    );
  }
}