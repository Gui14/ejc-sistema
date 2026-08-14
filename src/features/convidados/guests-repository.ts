import {
  getSheetRows,
  updateSheetRow,
} from "@/lib/google/sheets";

const GUEST_SHEET = "Convidados";

const COLUMNS = {
  id: 0,
  groupId: 1,
  sponsorId: 2,
  church: 3,
  otherChurch: 4,
  profile: 5,
  name: 6,
  whatsapp: 7,
  adoptiveParentsName: 8,
  adoptiveParentsWhatsapp: 9,
  foodRestriction: 10,
  personPhotoUrl: 11,
  rgPhotoUrl: 12,
  futureFields: 13,
  token: 14,
  status: 15,
  completedAt: 16,
  createdAt: 17,
  updatedAt: 18,
  recordStatus: 19,
} as const;

export type GuestSheetRecord = {
  rowNumber: number;
  id: string;
  groupId: string;
  sponsorId: string;
  church: string;
  otherChurch: string;
  profile: string;
  name: string;
  whatsapp: string;
  adoptiveParentsName: string;
  adoptiveParentsWhatsapp: string;
  foodRestriction: string;
  personPhotoUrl: string;
  rgPhotoUrl: string;
  futureFields: string;
  token: string;
  status: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
  recordStatus: string;
};

function cell(row: string[], index: number) {
  return row[index] ?? "";
}

function mapRow(
  row: string[],
  rowNumber: number,
): GuestSheetRecord {
  return {
    rowNumber,
    id: cell(row, COLUMNS.id),
    groupId: cell(row, COLUMNS.groupId),
    sponsorId: cell(row, COLUMNS.sponsorId),
    church: cell(row, COLUMNS.church),
    otherChurch: cell(row, COLUMNS.otherChurch),
    profile: cell(row, COLUMNS.profile),
    name: cell(row, COLUMNS.name),
    whatsapp: cell(row, COLUMNS.whatsapp),
    adoptiveParentsName: cell(
      row,
      COLUMNS.adoptiveParentsName,
    ),
    adoptiveParentsWhatsapp: cell(
      row,
      COLUMNS.adoptiveParentsWhatsapp,
    ),
    foodRestriction: cell(row, COLUMNS.foodRestriction),
    personPhotoUrl: cell(row, COLUMNS.personPhotoUrl),
    rgPhotoUrl: cell(row, COLUMNS.rgPhotoUrl),
    futureFields: cell(row, COLUMNS.futureFields),
    token: cell(row, COLUMNS.token),
    status: cell(row, COLUMNS.status),
    completedAt: cell(row, COLUMNS.completedAt),
    createdAt: cell(row, COLUMNS.createdAt),
    updatedAt: cell(row, COLUMNS.updatedAt),
    recordStatus: cell(row, COLUMNS.recordStatus),
  };
}

export async function findGuestByTokenFromSheet(
  token: string,
) {
  const rows = await getSheetRows(GUEST_SHEET);

  if (rows.length <= 1) {
    return null;
  }

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    const record = mapRow(row, index + 1);

    if (
      record.token === token &&
      record.recordStatus !== "DELETED"
    ) {
      return record;
    }
  }

  return null;
}

export async function updateGuestInSheet(
  guest: GuestSheetRecord,
  update: {
    foodRestriction: string;
    personPhotoUrl: string;
    rgPhotoUrl: string;
    futureFields?: string;
  },
) {
  const now = new Date().toISOString();

  const values = [
    guest.id,
    guest.groupId,
    guest.sponsorId,
    guest.church,
    guest.otherChurch,
    guest.profile,
    guest.name,
    guest.whatsapp,
    guest.adoptiveParentsName,
    guest.adoptiveParentsWhatsapp,
    update.foodRestriction,
    update.personPhotoUrl,
    update.rgPhotoUrl,
    update.futureFields ?? guest.futureFields ?? "{}",
    guest.token,
    "COMPLETED",
    now,
    guest.createdAt,
    now,
    guest.recordStatus || "ACTIVE",
  ];

  await updateSheetRow(
    GUEST_SHEET,
    guest.rowNumber,
    values,
  );

  return {
    ...guest,
    foodRestriction: update.foodRestriction,
    personPhotoUrl: update.personPhotoUrl,
    rgPhotoUrl: update.rgPhotoUrl,
    futureFields: update.futureFields ?? guest.futureFields ?? "{}",
    status: "COMPLETED",
    completedAt: now,
    updatedAt: now,
  };
}