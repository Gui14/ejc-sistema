import { uploadFileToDrive } from "@/lib/google/drive";
import { appendSheetRow } from "@/lib/google/sheets";
import {
  mapFileToSheetRow,
  mapGroupToSheetRow,
  mapGuestToSheetRow,
  mapSponsorToSheetRow,
} from "@/lib/google/sheets-mappers";
import type {
  RegistrationFile,
  RegistrationGroup,
} from "@/types/registration";

import type {
  DriveFileCategory,
} from "@/features/inscricoes/registration-types";

export async function persistRegistrationGroup(
  group: RegistrationGroup,
  pixFiles: File[],
) {
  const uploadedFiles: RegistrationFile[] = [];

  for (const file of pixFiles) {
    const uploadedFile = await uploadFileToDrive(
      file,
      "PIX_RECEIPT",
    );

    uploadedFiles.push({
      id: `receipt_${crypto.randomUUID()}`,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      driveFileId: uploadedFile.id ?? null,
      driveUrl: uploadedFile.webViewLink ?? null,
      category: "PIX_RECEIPT",
      guestId: null,
    });
  }

  const groupWithFiles: RegistrationGroup = {
    ...group,
    pixReceipts: uploadedFiles,
  };

  const comprovanteDriveUrl = uploadedFiles
    .map((file) => file.driveUrl)
    .filter((url): url is string => Boolean(url))
    .join("\n");

  await appendSheetRow(
    "Inscricoes",
    mapGroupToSheetRow(
      groupWithFiles,
      comprovanteDriveUrl,
    ),
  );

  await appendSheetRow(
    "Padrinhos",
    mapSponsorToSheetRow(groupWithFiles),
  );

  for (const guest of groupWithFiles.guests) {
    await appendSheetRow(
      "Convidados",
      mapGuestToSheetRow(groupWithFiles, guest),
    );
  }

  for (const file of groupWithFiles.pixReceipts) {
    await appendSheetRow(
      "Arquivos",
      mapFileToSheetRow(groupWithFiles, file),
    );
  }

  return groupWithFiles;
}