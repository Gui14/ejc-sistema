import { NextResponse } from "next/server";
import { createRegistrationGroup } from "@/features/inscricoes/mapper";
import { persistRegistrationGroup } from "@/features/inscricoes/create-registration";
import { registrationSchema } from "@/features/inscricoes/schema";

export const runtime = "nodejs";

const maxFileSize = 10 * 1024 * 1024;
const maxFileCount = 10;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const rawData = formData.get("data");

    if (typeof rawData !== "string") {
      return NextResponse.json(
        {
          ok: false,
          error: "Dados da inscrição não foram enviados.",
        },
        { status: 400 },
      );
    }

    const parsedData = JSON.parse(rawData);

    const files = formData
      .getAll("pixReceipt")
      .filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Envie pelo menos um comprovante.",
        },
        { status: 400 },
      );
    }

    if (files.length > maxFileCount) {
      return NextResponse.json(
        {
          ok: false,
          error: `Você pode enviar no máximo ${maxFileCount} arquivos.`,
        },
        { status: 400 },
      );
    }

    for (const file of files) {
      if (file.size > maxFileSize) {
        return NextResponse.json(
          {
            ok: false,
            error: `O arquivo ${file.name} excede o limite de 10 MB.`,
          },
          { status: 400 },
        );
      }

      if (
        ![
          "image/png",
          "image/jpeg",
          "application/pdf",
        ].includes(file.type)
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: `Tipo de arquivo não permitido: ${file.name}.`,
          },
          { status: 400 },
        );
      }
    }

    const result = registrationSchema.safeParse({
      ...parsedData,
      pixReceipt: undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Dados inválidos.",
          issues: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const group = createRegistrationGroup({
      ...result.data,
      pixReceipt: undefined,
    });

    const persistedGroup = await persistRegistrationGroup(
      group,
      files,
    );


    return NextResponse.json(
      {
        ok: true,
        group: persistedGroup,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar inscrição:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível criar a inscrição.",
      },
      { status: 500 },
    );
  }
}