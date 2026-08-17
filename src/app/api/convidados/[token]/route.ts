import { NextResponse } from "next/server";

import {
  maxFileSize,
} from "@/features/inscricoes/schema";

import {
  uploadFileToDrive,
} from "@/lib/google/drive";

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

const PERSON_PHOTO_TYPES = [
  "image/png",
  "image/jpeg",
];

const RG_PHOTO_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
];

function jsonError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status },
  );
}

function getFileFromFormData(
  formData: FormData,
  fieldName: string,
) {
  const value = formData.get(fieldName);

  return value instanceof File
    ? value
    : null;
}

function validateFile(
  file: File,
  allowedTypes: string[],
  label: string,
) {
  if (!allowedTypes.includes(file.type)) {
    return `${label} possui formato inválido.`;
  }

  if (file.size > maxFileSize) {
    return `${label} deve ter no máximo 10 MB.`;
  }

  return null;
}

function serializeGuest(guest: {
  id: string;
  name: string;
  status: string;
  foodRestriction?: string | null;
  personPhotoUrl?: string | null;
  rgPhotoUrl?: string | null;
}) {
  return {
    id: guest.id,
    name: guest.name,
    completionStatus: guest.status,
    foodRestriction:
      guest.foodRestriction ?? null,
    personPhotoUrl:
      guest.personPhotoUrl ?? null,
    rgPhotoUrl:
      guest.rgPhotoUrl ?? null,
  };
}

function requiredText(
  value: FormDataEntryValue | null,
  label: string,
) {
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

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { token } =
      await context.params;

    const guest =
      await findGuestByTokenFromSheet(token);

    if (!guest) {
      return jsonError(
        "Link do convidado não encontrado.",
        404,
      );
    }

    return NextResponse.json({
      ok: true,
      guest: serializeGuest(guest),
    });
  } catch (error) {
    console.error(
      "Erro ao consultar convidado no Google Sheets:",
      error,
    );

    return jsonError(
      "Não foi possível carregar o cadastro.",
      500,
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  let uploadedPersonPhotoId: string | null =
    null;

  let uploadedRgPhotoId: string | null =
    null;

  try {
    const { token } =
      await context.params;

    const guest =
      await findGuestByTokenFromSheet(token);

    if (!guest) {
      return jsonError(
        "Link do convidado não encontrado.",
        404,
      );
    }

    const formData =
      await request.formData();

    const age = formData.get("age");
const birthDate = formData.get("birthDate");
const sex = formData.get("sex");
const education = formData.get("education");
const religion = formData.get("religion");
const otherReligion =
  formData.get("otherReligion");
const church = formData.get("church");
const otherChurch =
  formData.get("otherChurch");
const email = formData.get("email");
const phone = formData.get("phone");
const address = formData.get("address");
const neighborhood =
  formData.get("neighborhood");
const city = formData.get("city");
const otherCity =
  formData.get("otherCity");
const cep = formData.get("cep");
const completionFoodRestriction =
  formData.get("completionFoodRestriction");
const otherFoodRestriction =
  formData.get("otherFoodRestriction");
const specialMedication =
  formData.get("specialMedication");
const otherSpecialMedication =
  formData.get("otherSpecialMedication");

    const personPhoto =
      getFileFromFormData(
        formData,
        "personPhoto",
      );

    if (!personPhoto) {
      return jsonError(
        "Envie a foto do convidado.",
        400,
      );
    }

    const rgPhoto =
      getFileFromFormData(
        formData,
        "rgPhoto",
      );

    if (!rgPhoto) {
      return jsonError(
        "Envie a foto do RG.",
        400,
      );
    }

    const personPhotoError =
      validateFile(
        personPhoto,
        PERSON_PHOTO_TYPES,
        "A foto do convidado",
      );

    if (personPhotoError) {
      return jsonError(
        personPhotoError,
        400,
      );
    }

    const rgPhotoError =
      validateFile(
        rgPhoto,
        RG_PHOTO_TYPES,
        "O RG",
      );

    if (rgPhotoError) {
      return jsonError(
        rgPhotoError,
        400,
      );
    }

    const uploadedPersonPhoto =
      await uploadFileToDrive(
        personPhoto,
        "GUEST_PHOTO",
      );

    uploadedPersonPhotoId =
      uploadedPersonPhoto.id ?? null;

    const uploadedRgPhoto =
      await uploadFileToDrive(
        rgPhoto,
        "RG_PHOTO",
      );

    uploadedRgPhotoId =
      uploadedRgPhoto.id ?? null;

    const update = {
  age: requiredText(age, "Idade"),
  birthDate: requiredText(
    birthDate,
    "Data de nascimento",
  ),
  sex: requiredText(sex, "Sexo"),
  education: requiredText(
    education,
    "Escolaridade",
  ),
  religion: requiredText(
    religion,
    "Religião",
  ),
  otherReligion:
    typeof otherReligion === "string"
      ? otherReligion.trim()
      : "",
  completionChurch: requiredText(
    church,
    "Igreja",
  ),
  completionOtherChurch:
    typeof otherChurch === "string"
      ? otherChurch.trim()
      : "",
  completionEmail: requiredText(
    email,
    "E-mail",
  ),
  completionPhone: requiredText(
    phone,
    "Telefone",
  ),
  address: requiredText(
    address,
    "Endereço",
  ),
  neighborhood: requiredText(
    neighborhood,
    "Bairro",
  ),
  city: requiredText(city, "Cidade"),
  otherCity:
    typeof otherCity === "string"
      ? otherCity.trim()
      : "",
  cep: requiredText(cep, "CEP"),
  completionFoodRestriction:
    requiredText(
      completionFoodRestriction,
      "Restrição alimentar",
    ),
  otherFoodRestriction:
    typeof otherFoodRestriction ===
    "string"
      ? otherFoodRestriction.trim()
      : "",
  specialMedication: requiredText(
    specialMedication,
    "Medicação especial",
  ),
  otherSpecialMedication:
    typeof otherSpecialMedication ===
    "string"
      ? otherSpecialMedication.trim()
      : "",
  personPhotoUrl:
    uploadedPersonPhoto.webViewLink ?? "",
  rgPhotoUrl:
    uploadedRgPhoto.webViewLink ?? "",
};
if (
  religion === "OTHER" &&
  !String(otherReligion ?? "").trim()
) {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Informe sua religião.",
    },
    { status: 400 },
  );
}

if (
  church === "OTHER" &&
  !String(otherChurch ?? "").trim()
) {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Informe o nome da igreja.",
    },
    { status: 400 },
  );
}

if (
  city === "OTHER" &&
  !String(otherCity ?? "").trim()
) {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Informe o nome da cidade.",
    },
    { status: 400 },
  );
}

    return NextResponse.json({
      ok: true,
      guest: updateGuestInSheet(guest, update),
  
    });
  } catch (error) {
    console.error(
      "Erro ao salvar complementação do convidado:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar os dados do convidado.",

        uploadedPersonPhotoId,
        uploadedRgPhotoId,
      },
      { status: 500 },
    );
  }
}