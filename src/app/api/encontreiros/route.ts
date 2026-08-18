import { NextResponse } from "next/server";

import {
  createEncontreiro,
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

function optionalText(
  formData: FormData,
  fieldName: string,
) {
  const value = formData.get(fieldName);

  return typeof value === "string"
    ? value.trim()
    : "";
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

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "O cadastro público utiliza POST. A listagem deve ser feita pela rota administrativa.",
    },
    { status: 405 },
  );
}

export async function POST(
  request: Request,
) {
  try {
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

    if (!validateEmail(email)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Informe um e-mail válido.",
        },
        { status: 400 },
      );
    }

    if (!validateBirthDate(birthDate)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Informe uma data de nascimento válida.",
        },
        { status: 400 },
      );
    }

    if (
      church === "OTHER" &&
      !otherChurch
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Informe o nome da outra igreja.",
        },
        { status: 400 },
      );
    }

    if (
      city === "OTHER" &&
      !otherCity
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Informe o nome da outra cidade.",
        },
        { status: 400 },
      );
    }

    const pixReceipt =
      formData.get("pixReceipt");

    if (
      !(pixReceipt instanceof File) ||
      pixReceipt.size === 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Envie o comprovante PIX.",
        },
        { status: 400 },
      );
    }

    if (
      !allowedPixTypes.includes(
        pixReceipt.type,
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "O comprovante deve ser PNG, JPG ou PDF.",
        },
        { status: 400 },
      );
    }

    if (
      pixReceipt.size > maxFileSize
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "O comprovante deve ter no máximo 10 MB.",
        },
        { status: 400 },
      );
    }

    const uploaded =
      await uploadFileToDrive(
        pixReceipt,
        "ENCONTREIRO_PIX",
      );

    const id =
      `encontreiro_${crypto.randomUUID()}`;

    const encontreiro =
      await createEncontreiro({
        id,
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
        pixReceiptUrl:
          uploaded.webViewLink ??
          uploaded.webContentLink ??
          "",
        pixStatus: "PENDING",
        adminObservation: "",
      });

    return NextResponse.json(
      {
        ok: true,
        message:
          "Inscrição enviada com sucesso.",
        encontreiro,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Erro ao criar inscrição de encontreiro:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a inscrição.",
      },
      { status: 400 },
    );
  }
}