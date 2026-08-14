import { google } from "googleapis";
import { Readable } from "node:stream";
import { getAuthenticatedOAuthClient } from "./oauth";
import type { DriveFileCategory } from "@/types/registration";

function getRequiredFolderId(
  category: DriveFileCategory,
) {
  const envNameByCategory: Record<
    DriveFileCategory,
    string
  > = {
    PIX_RECEIPT: "GOOGLE_DRIVE_PIX_FOLDER_ID",
    GUEST_PHOTO: "GOOGLE_DRIVE_GUEST_PHOTOS_FOLDER_ID",
    RG_PHOTO: "GOOGLE_DRIVE_RG_PHOTOS_FOLDER_ID",
  };

  const envName = envNameByCategory[category];
  const folderId = process.env[envName];

  if (!folderId) {
    throw new Error(`${envName} não foi configurada.`);
  }

  return folderId.trim();
}

export function getDriveClient() {
  const auth = getAuthenticatedOAuthClient();

  return google.drive({
    version: "v3",
    auth,
  });
}

export async function getDriveFolder(
  category: DriveFileCategory,
) {
  const drive = getDriveClient();

  const folderId = getRequiredFolderId(category);

  const response = await drive.files.get({
    fileId: folderId,
    fields: "id,name,mimeType,parents",
  });

  return response.data;
}

export async function uploadFileToDrive(
  file: File,
  category: DriveFileCategory,
) {
  const drive = getDriveClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const folderId = getRequiredFolderId(category);

  const response = await drive.files.create({
    requestBody: {
      name: file.name,
      mimeType: file.type,
      parents: [folderId],
    },
    media: {
      mimeType: file.type,
      body: Readable.from(buffer),
    },
    fields: "id,name,mimeType,size,webViewLink,parents",
  });

  return response.data;
}

export async function moveDriveFileToTrash(
  fileId: string,
) {
  if (!fileId) {
    return;
  }

  const drive = getDriveClient();

  await drive.files.update({
    fileId,
    requestBody: {
      trashed: true,
    },
    fields: "id,trashed",
  });
}

