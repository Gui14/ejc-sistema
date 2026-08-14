import { NextResponse } from "next/server";

import { maxFileSize } from "@/features/inscricoes/schema";
import { uploadFileToDrive } from "@/lib/google/drive";
import {
  findGuestByTokenFromSheet,
  updateGuestInSheet,
} from "@/features/convidados/guests-repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { token } = await context.params;

    const guest = await findGuestByTokenFromSheet(token);

    if (!guest) {
      return NextResponse.json(
        {
          ok: false,
          error: "Link do convidado não encontrado.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      guest: {
        id: guest.id,
        name: guest.name,
        completionStatus: guest.status,
        foodRestriction: guest.foodRestriction || null,
        personPhotoUrl: guest.personPhotoUrl || null,
        rgPhotoUrl: guest.rgPhotoUrl || null,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao consultar convidado no Google Sheets:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível carregar o cadastro.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  let uploadedPersonPhotoId: string | null = null;
  let uploadedRgPhotoId: string | null = null;

  try {
    const { token } = await context.params;

    const guest = await findGuestByTokenFromSheet(token);

    if (!guest) {
      return NextResponse.json(
        {
          ok: false,
          error: "Link do convidado não encontrado.",
        },
        { status: 404 },
      );
    }

    const formData = await request.formData();

    const foodRestriction = formData.get(
      "foodRestriction",
    );

    if (
      typeof foodRestriction !== "string" ||
      foodRestriction.trim().length === 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Informe a questão alimentar.",
        },
        { status: 400 },
      );
    }

    const personPhoto = formData.get("personPhoto");
    const rgPhoto = formData.get("rgPhoto");

    if (!(personPhoto instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Envie a foto do convidado.",
        },
        { status: 400 },
      );
    }

    if (!(rgPhoto instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Envie a foto do RG.",
        },
        { status: 400 },
      );
    }

    const allowedPersonPhotoTypes = [
      "image/png",
      "image/jpeg",
    ];

    const allowedRgTypes = [
      "image/png",
      "image/jpeg",
      "application/pdf",
    ];

    if (
      !allowedPersonPhotoTypes.includes(personPhoto.type) ||
      personPhoto.size > maxFileSize
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "A foto do convidado deve ser PNG ou JPG e ter até 10 MB.",
        },
        { status: 400 },
      );
    }

    if (
      !allowedRgTypes.includes(rgPhoto.type) ||
      rgPhoto.size > maxFileSize
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "O RG deve ser PNG, JPG ou PDF e ter até 10 MB.",
        },
        { status: 400 },
      );
    }

    const uploadedPersonPhoto = await uploadFileToDrive(
      personPhoto,
      "GUEST_PHOTO",
    );

    uploadedPersonPhotoId = uploadedPersonPhoto.id ?? null;

    const uploadedRgPhoto = await uploadFileToDrive(
      rgPhoto,
      "RG_PHOTO",
    );

    uploadedRgPhotoId = uploadedRgPhoto.id ?? null;

    const updatedGuest = await updateGuestInSheet(
      guest,
      {
        foodRestriction: foodRestriction.trim(),
        personPhotoUrl:
          uploadedPersonPhoto.webViewLink ?? "",
        rgPhotoUrl: uploadedRgPhoto.webViewLink ?? "",
        futureFields: guest.futureFields || "{}",
      },
    );

    return NextResponse.json({
      ok: true,
      guest: {
        id: updatedGuest.id,
        name: updatedGuest.name,
        completionStatus: updatedGuest.status,
        foodRestriction: updatedGuest.foodRestriction,
        personPhotoUrl: updatedGuest.personPhotoUrl,
        rgPhotoUrl: updatedGuest.rgPhotoUrl,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao salvar complementação do convidado:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível salvar os dados do convidado.",
        uploadedPersonPhotoId,
        uploadedRgPhotoId,
      },
      { status: 500 },
    );
  }
}