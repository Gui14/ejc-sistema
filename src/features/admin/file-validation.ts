export const ADMIN_MAX_FILE_SIZE =
  10 * 1024 * 1024;

export const PERSON_PHOTO_TYPES = [
  "image/png",
  "image/jpeg",
];

export const RG_PHOTO_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
];

export function validatePersonPhoto(file: File) {
  if (!PERSON_PHOTO_TYPES.includes(file.type)) {
    throw new Error(
      "A foto do convidado deve estar em PNG ou JPG.",
    );
  }

  if (file.size > ADMIN_MAX_FILE_SIZE) {
    throw new Error(
      "A foto do convidado deve ter no máximo 10 MB.",
    );
  }
}

export function validateRgPhoto(file: File) {
  if (!RG_PHOTO_TYPES.includes(file.type)) {
    throw new Error(
      "O RG deve estar em PNG, JPG ou PDF.",
    );
  }

  if (file.size > ADMIN_MAX_FILE_SIZE) {
    throw new Error(
      "O RG deve ter no máximo 10 MB.",
    );
  }
}