import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/admin-session";
import {
  getAdminGuestById,
  updateAdminGuest,
} from "@/features/admin/admin-repository";
import { uploadFileToDrive } from "@/lib/google/drive";
import { moveDriveFileToTrash } from "@/lib/google/drive";
import {
  validatePersonPhoto,
  validateRgPhoto,
} from "@/features/admin/file-validation";
import { updateGuestFileLinks } from "@/features/admin/admin-repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    guestId: string;
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
    const { guestId } = await context.params;
    const guest = await getAdminGuestById(guestId);

    if (!guest) {
      return NextResponse.json(
        {
          ok: false,
          error: "Convidado não encontrado.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      guest,
    });
  } catch (error) {
    console.error("Erro ao carregar convidado:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível carregar o convidado.",
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
    const { guestId } = await context.params;
    const body = await request.json();

    const updatedGuest = await updateAdminGuest(
      guestId,
      body,
    );

    return NextResponse.json({
      ok: true,
      guest: updatedGuest,
    });
  } catch (error) {
    console.error("Erro ao atualizar convidado:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível atualizar o convidado.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
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
    const { guestId } = await context.params;
    const guest = await getAdminGuestById(guestId);

    if (!guest) {
      return NextResponse.json(
        {
          ok: false,
          error: "Convidado não encontrado.",
        },
        { status: 404 },
      );
    }

    const formData = await request.formData();

    const personPhoto = formData.get("personPhoto");
    const rgPhoto = formData.get("rgPhoto");

    if (
      !(personPhoto instanceof File) &&
      !(rgPhoto instanceof File)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Envie pelo menos um arquivo.",
        },
        { status: 400 },
      );
    }

    let personPhotoUrl: string | undefined;
    let rgPhotoUrl: string | undefined;

    if (personPhoto instanceof File) {
      validatePersonPhoto(personPhoto);

      const uploadedPersonPhoto =
        await uploadFileToDrive(
          personPhoto,
          "GUEST_PHOTO",
        );

      if (guest.personPhotoUrl) {
        const oldPersonPhotoId =
          extractDriveFileId(guest.personPhotoUrl);

        if (oldPersonPhotoId) {
          await moveDriveFileToTrash(
            oldPersonPhotoId,
          );
        }
      }

      personPhotoUrl =
        uploadedPersonPhoto.webViewLink ?? "";
    }

    if (rgPhoto instanceof File) {
      validateRgPhoto(rgPhoto);

      const uploadedRgPhoto =
        await uploadFileToDrive(
          rgPhoto,
          "RG_PHOTO",
        );

      if (guest.rgPhotoUrl) {
        const oldRgPhotoId =
          extractDriveFileId(guest.rgPhotoUrl);

        if (oldRgPhotoId) {
          await moveDriveFileToTrash(oldRgPhotoId);
        }
      }

      rgPhotoUrl = uploadedRgPhoto.webViewLink ?? "";
    }

    const updatedGuest = await updateGuestFileLinks(
      guestId,
      {
        personPhotoUrl,
        rgPhotoUrl,
      },
    );

    return NextResponse.json({
      ok: true,
      guest: updatedGuest,
    });
  } catch (error) {
    console.error(
      "Erro ao substituir arquivos do convidado:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível substituir os arquivos.",
      },
      { status: 400 },
    );
  }
}

function extractDriveFileId(
  url: string | null | undefined,
) {
  if (!url) {
    return null;
  }

  const fileIdMatch = url.match(
    /\/file\/d\/([^/]+)/,
  );

  if (fileIdMatch?.[1]) {
    return fileIdMatch[1];
  }

  const queryIdMatch = url.match(
    /[?&]id=([^&]+)/,
  );

  return queryIdMatch?.[1] ?? null;
}

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{
      guestId: string;
    }>;
  },
) {
  try {
    const { guestId } = await context.params;

    if (!guestId) {
      return NextResponse.json(
        {
          ok: false,
          error: "ID do convidado não informado.",
        },
        { status: 400 },
      );
    }

    const guest = await getAdminGuestById(guestId);

    if (!guest) {
      return NextResponse.json(
        {
          ok: false,
          error: "Convidado não encontrado.",
        },
        { status: 404 },
      );
    }

    const fileUrls = [
      guest.personPhotoUrl,
      guest.rgPhotoUrl,
    ].filter(Boolean);

    for (const fileUrl of fileUrls) {
      const driveFileId =
        extractDriveFileId(fileUrl);

      if (driveFileId) {
        await moveDriveFileToTrash(
          driveFileId,
        );
      }
    }

    await softDeleteGuest(guestId);

    return NextResponse.json({
      ok: true,
      guestId,
      message: "Convidado excluído com sucesso.",
    });
  } catch (error) {
    console.error(
      "Erro ao excluir convidado:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o convidado.",
      },
      { status: 500 },
    );
  }
}

function softDeleteGuest(guestId: string) {
  throw new Error("Function not implemented.");
}

