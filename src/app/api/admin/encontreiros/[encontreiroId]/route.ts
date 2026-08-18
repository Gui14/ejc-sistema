import { NextResponse } from "next/server";

import {
  getEncontreiroById,
  updateEncontreiro,
  updateEncontreiroPix,
  type PixStatus,
} from "@/features/encontreiros/encontreiros-repository";
import {
  maxFileSize,
} from "@/features/encontreiros/schema";
import {
  uploadFileToDrive,
} from "@/lib/google/drive";

export const runtime = "nodejs";

const allowedPixTypes = [
  "image/png",
  "image/jpeg",
  "application/pdf",
];

const allowedPixStatuses: PixStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
];

type RouteContext = {
  params: Promise<{
    encontreiroId: string;
  }>;
};

function optionalText(
  formData: FormData,
  fieldName: string,
) {
  const value = formData.get(fieldName);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function requiredText(
  formData: FormData,
  fieldName: string,
  label: string,
) {
  const value = formData.get(fieldName);

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

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

function validateBirthDate(
  birthDate: string,
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      birthDate,
    )
  ) {
    return false;
  }

  const [year, month, day] = birthDate
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function validatePixStatus(
  value: string,
): value is PixStatus {
  return allowedPixStatuses.includes(
    value as PixStatus,
  );
}

function getCurrentPixUrl(
  current: Awaited<
    ReturnType<typeof getEncontreiroById>
  >,
) {
  return current?.pixReceiptUrl ?? "";
}

async function parseJsonRequest(
  request: Request,
) {
  const body = await request.json();

  const pixStatus = String(
    body.pixStatus ?? "",
  );

  const adminObservation = String(
    body.adminObservation ?? "",
  ).trim();

  if (!validatePixStatus(pixStatus)) {
    throw new Error(
      "Status do PIX inválido.",
    );
  }

  if (
    pixStatus === "REJECTED" &&
    !adminObservation
  ) {
    throw new Error(
      "Informe o motivo da rejeição do PIX.",
    );
  }

  return {
    pixStatus,
    adminObservation,
  };
}

async function parseFormRequest(
  request: Request,
  current: NonNullable<
    Awaited<
      ReturnType<typeof getEncontreiroById>
    >
  >,
) {
  const formData =
    await request.formData();

  const name = requiredText(
    formData,
    "name",
    "Nome completo",
  );

  const whatsapp = requiredText(
    formData,
    "whatsapp",
    "WhatsApp",
  );

  const email = requiredText(
    formData,
    "email",
    "E-mail",
  );

  const birthDate = requiredText(
    formData,
    "birthDate",
    "Data de nascimento",
  );

  const sex = requiredText(
    formData,
    "sex",
    "Sexo",
  );

  const church = requiredText(
    formData,
    "church",
    "Igreja",
  );

  const city = requiredText(
    formData,
    "city",
    "Cidade",
  );

  const otherChurch = optionalText(
    formData,
    "otherChurch",
  );

  const otherCity = optionalText(
    formData,
    "otherCity",
  );

  const observations = optionalText(
    formData,
    "observations",
  );

  const pixStatusValue = optionalText(
    formData,
    "pixStatus",
  );

  const pixStatus =
    pixStatusValue ||
    current.pixStatus ||
    "PENDING";

  const adminObservation = optionalText(
    formData,
    "adminObservation",
  );

  if (!validateEmail(email)) {
    throw new Error(
      "Informe um e-mail válido.",
    );
  }

  if (!validateBirthDate(birthDate)) {
    throw new Error(
      "Informe uma data de nascimento válida.",
    );
  }

  if (
    church === "OTHER" &&
    !otherChurch
  ) {
    throw new Error(
      "Informe o nome da outra igreja.",
    );
  }

  if (
    city === "OTHER" &&
    !otherCity
  ) {
    throw new Error(
      "Informe o nome da outra cidade.",
    );
  }

  if (!validatePixStatus(pixStatus)) {
    throw new Error(
      "Status do PIX inválido.",
    );
  }

  if (
    pixStatus === "REJECTED" &&
    !adminObservation
  ) {
    throw new Error(
      "Informe o motivo da rejeição do PIX.",
    );
  }

  let pixReceiptUrl = getCurrentPixUrl(
    current,
  );

  const pixReceipt =
    formData.get("pixReceipt");

  if (
    pixReceipt instanceof File &&
    pixReceipt.size > 0
  ) {
    if (
      !allowedPixTypes.includes(
        pixReceipt.type,
      )
    ) {
      throw new Error(
        "O comprovante deve ser PNG, JPG ou PDF.",
      );
    }

    if (
      pixReceipt.size > maxFileSize
    ) {
      throw new Error(
        "O comprovante deve ter no máximo 10 MB.",
      );
    }

    const uploaded =
      await uploadFileToDrive(
        pixReceipt,
        "ENCONTREIRO_PIX",
      );

    pixReceiptUrl =
      uploaded.webViewLink ??
      uploaded.webContentLink ??
      pixReceiptUrl;
  }

  return {
    name,
    whatsapp,
    email,
    birthDate,
    sex,
    church,
    otherChurch,
    city,
    otherCity,
    observations,
    pixStatus,
    adminObservation,
    pixReceiptUrl,
  };
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { encontreiroId } =
      await context.params;

    const encontreiro =
      await getEncontreiroById(
        encontreiroId,
      );

    if (!encontreiro) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Encontreiro não encontrado.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      encontreiro,
    });
  } catch (error) {
    console.error(
      "Erro ao carregar encontreiro:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o encontreiro.",
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
    const { encontreiroId } =
      await context.params;

    const current =
      await getEncontreiroById(
        encontreiroId,
      );

    if (!current) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Encontreiro não encontrado.",
        },
        { status: 404 },
      );
    }

    const contentType =
      request.headers.get("content-type") ??
      "";

    if (
      contentType.includes(
        "multipart/form-data",
      )
    ) {
      const data =
        await parseFormRequest(
          request,
          current,
        );

      const updated =
        await updateEncontreiro({
          id: encontreiroId,
          name: data.name,
          whatsapp: data.whatsapp,
          email: data.email,
          birthDate: data.birthDate,
          sex: data.sex,
          church: data.church,
          otherChurch: data.otherChurch,
          city: data.city,
          otherCity: data.otherCity,
          observations: data.observations,
          pixReceiptUrl:
            data.pixReceiptUrl,
          pixStatus: data.pixStatus,
          adminObservation:
            data.adminObservation,
        });

      return NextResponse.json({
        ok: true,
        encontreiro: updated,
      });
    }

    const data =
      await parseJsonRequest(request);

    const updated =
      await updateEncontreiroPix({
        id: encontreiroId,
        pixStatus: data.pixStatus,
        adminObservation:
          data.adminObservation,
      });

    return NextResponse.json({
      ok: true,
      encontreiro: updated,
    });
  } catch (error) {
    console.error(
      "Erro ao atualizar encontreiro:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o encontreiro.",
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
    const { encontreiroId } =
      await context.params;

    const current =
      await getEncontreiroById(
        encontreiroId,
      );

    if (!current) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Encontreiro não encontrado.",
        },
        { status: 404 },
      );
    }

    const updated =
      await updateEncontreiro({
        id: encontreiroId,
        name: current.name,
        whatsapp: current.whatsapp,
        email: current.email,
        birthDate: current.birthDate,
        sex: current.sex,
        church: current.church,
        otherChurch: current.otherChurch,
        city: current.city,
        otherCity: current.otherCity,
        observations: current.observations,
        pixReceiptUrl:
          current.pixReceiptUrl,
        pixStatus: validatePixStatus(
          current.pixStatus,
        )
          ? current.pixStatus
          : "PENDING",
        adminObservation:
          current.adminObservation,
        recordStatus: "DELETED",
      });

    return NextResponse.json({
      ok: true,
      encontreiro: updated,
    });
  } catch (error) {
    console.error(
      "Erro ao excluir encontreiro:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o encontreiro.",
      },
      { status: 400 },
    );
  }
}