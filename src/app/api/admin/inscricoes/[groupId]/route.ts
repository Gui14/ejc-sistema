import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin-session";
import {
  deleteGroup,
  getAdminGroups,
} from "@/features/admin/admin-repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    groupId: string;
  }>;
};

export async function DELETE(
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
    const groups = await getAdminGroups();

    const group = groups.find(
      (item) => item.groupId === groupId,
    );

    if (!group) {
      return NextResponse.json(
        {
          ok: false,
          error: "Inscrição não encontrada.",
        },
        { status: 404 },
      );
    }

    const result = await deleteGroup(group);

    return NextResponse.json({
      ok: true,
      message:
        "Inscrição, padrinho e convidados foram desativados.",
      result,
    });
  } catch (error) {
    console.error(
      "Erro ao excluir inscrição em cascata:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Não foi possível desativar os registros relacionados.",
      },
      { status: 500 },
    );
  }
}