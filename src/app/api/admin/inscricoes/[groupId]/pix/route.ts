import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin-session";
import {
  getAdminGroups,
  updateGroupPixStatus,
  type PixStatus,
} from "@/features/admin/admin-repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    groupId: string;
  }>;
};

const allowedStatuses: PixStatus[] = [
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
];

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

    const status = body.status as PixStatus;
    const approvedAmount =
      typeof body.approvedAmount === "number"
        ? body.approvedAmount
        : undefined;

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Status de PIX inválido.",
        },
        { status: 400 },
      );
    }

    if (
      status === "APPROVED" &&
      (approvedAmount === undefined ||
        approvedAmount < 0)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Informe um valor aprovado válido.",
        },
        { status: 400 },
      );
    }

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

    const updatedGroup = await updateGroupPixStatus(
      group,
      status,
      approvedAmount,
    );

    return NextResponse.json({
      ok: true,
      group: updatedGroup,
    });
  } catch (error) {
    console.error("Erro ao atualizar status do PIX:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível atualizar o PIX.",
      },
      { status: 500 },
    );
  }
}