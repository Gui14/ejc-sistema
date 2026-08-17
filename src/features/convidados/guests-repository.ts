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

  age: 20,
  birthDate: 21,
  sex: 22,
  education: 23,
  religion: 24,
  otherReligion: 25,
  completionChurch: 26,
  completionOtherChurch: 27,
  completionEmail: 28,
  completionPhone: 29,
  address: 30,
  neighborhood: 31,
  city: 32,
  otherCity: 33,
  cep: 34,
  completionFoodRestriction: 35,
  otherFoodRestriction: 36,
  specialMedication: 37,
  otherSpecialMedication: 38,
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

  age: string;
  birthDate: string;
  sex: string;
  education: string;
  religion: string;
  otherReligion: string;
  completionChurch: string;
  completionOtherChurch: string;
  completionEmail: string;
  completionPhone: string;
  address: string;
  neighborhood: string;
  city: string;
  otherCity: string;
  cep: string;
  completionFoodRestriction: string;
  otherFoodRestriction: string;
  specialMedication: string;
  otherSpecialMedication: string;
};

function cell(
  row: string[],
  index: number,
) {
  return row[index] ?? "";
}

function mapRow(
  row: string[],
  rowNumber: number,
): GuestSheetRecord {
  return {
    rowNumber,
    id: cell(row, COLUMNS.id),
    groupId: cell(
      row,
      COLUMNS.groupId,
    ),
    sponsorId: cell(
      row,
      COLUMNS.sponsorId,
    ),
    church: cell(
      row,
      COLUMNS.church,
    ),
    otherChurch: cell(
      row,
      COLUMNS.otherChurch,
    ),
    profile: cell(
      row,
      COLUMNS.profile,
    ),
    name: cell(
      row,
      COLUMNS.name,
    ),
    whatsapp: cell(
      row,
      COLUMNS.whatsapp,
    ),
    adoptiveParentsName: cell(
      row,
      COLUMNS.adoptiveParentsName,
    ),
    adoptiveParentsWhatsapp: cell(
      row,
      COLUMNS.adoptiveParentsWhatsapp,
    ),
    foodRestriction: cell(
      row,
      COLUMNS.foodRestriction,
    ),
    personPhotoUrl: cell(
      row,
      COLUMNS.personPhotoUrl,
    ),
    rgPhotoUrl: cell(
      row,
      COLUMNS.rgPhotoUrl,
    ),
    futureFields: cell(
      row,
      COLUMNS.futureFields,
    ),
    token: cell(
      row,
      COLUMNS.token,
    ),
    status: cell(
      row,
      COLUMNS.status,
    ),
    completedAt: cell(
      row,
      COLUMNS.completedAt,
    ),
    createdAt: cell(
      row,
      COLUMNS.createdAt,
    ),
    updatedAt: cell(
      row,
      COLUMNS.updatedAt,
    ),
    recordStatus: cell(
      row,
      COLUMNS.recordStatus,
    ),

    age: cell(row, COLUMNS.age),
    birthDate: cell(
      row,
      COLUMNS.birthDate,
    ),
    sex: cell(row, COLUMNS.sex),
    education: cell(
      row,
      COLUMNS.education,
    ),
    religion: cell(
      row,
      COLUMNS.religion,
    ),
    otherReligion: cell(
      row,
      COLUMNS.otherReligion,
    ),
    completionChurch: cell(
      row,
      COLUMNS.completionChurch,
    ),
    completionOtherChurch: cell(
      row,
      COLUMNS.completionOtherChurch,
    ),
    completionEmail: cell(
      row,
      COLUMNS.completionEmail,
    ),
    completionPhone: cell(
      row,
      COLUMNS.completionPhone,
    ),
    address: cell(
      row,
      COLUMNS.address,
    ),
    neighborhood: cell(
      row,
      COLUMNS.neighborhood,
    ),
    city: cell(row, COLUMNS.city),
    otherCity: cell(
      row,
      COLUMNS.otherCity,
    ),
    cep: cell(row, COLUMNS.cep),
    completionFoodRestriction: cell(
      row,
      COLUMNS.completionFoodRestriction,
    ),
    otherFoodRestriction: cell(
      row,
      COLUMNS.otherFoodRestriction,
    ),
    specialMedication: cell(
      row,
      COLUMNS.specialMedication,
    ),
    otherSpecialMedication: cell(
      row,
      COLUMNS.otherSpecialMedication,
    ),
  };
}

export async function findGuestByTokenFromSheet(
  token: string,
) {
  const rows =
    await getSheetRows(GUEST_SHEET);

  if (rows.length <= 1) {
    return null;
  }

  for (
    let index = 1;
    index < rows.length;
    index += 1
  ) {
    const record = mapRow(
      rows[index],
      index + 1,
    );

    if (
      record.token === token &&
      record.recordStatus !==
        "DELETED"
    ) {
      return record;
    }
  }

  return null;
}

export async function updateGuestInSheet(
  guest: GuestSheetRecord,
  update: {
    age: string;
    birthDate: string;
    sex: string;
    education: string;
    religion: string;
    otherReligion: string;
    completionChurch: string;
    completionOtherChurch: string;
    completionEmail: string;
    completionPhone: string;
    address: string;
    neighborhood: string;
    city: string;
    otherCity: string;
    cep: string;
    completionFoodRestriction: string;
    otherFoodRestriction: string;
    specialMedication: string;
    otherSpecialMedication: string;
    personPhotoUrl: string;
    rgPhotoUrl: string;
  },
) {
  const now =
    new Date().toISOString();

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
    guest.foodRestriction,
    update.personPhotoUrl,
    update.rgPhotoUrl,
    guest.futureFields || "{}",
    guest.token,
    "COMPLETED",
    now,
    guest.createdAt,
    now,
    guest.recordStatus || "ACTIVE",

    update.age,
    update.birthDate,
    update.sex,
    update.education,
    update.religion,
    update.otherReligion,
    update.completionChurch,
    update.completionOtherChurch,
    update.completionEmail,
    update.completionPhone,
    update.address,
    update.neighborhood,
    update.city,
    update.otherCity,
    update.cep,
    update.completionFoodRestriction,
    update.otherFoodRestriction,
    update.specialMedication,
    update.otherSpecialMedication,
  ];

  await updateSheetRow(
    GUEST_SHEET,
    guest.rowNumber,
    values,
  );

  return {
    ...guest,
    personPhotoUrl:
      update.personPhotoUrl,
    rgPhotoUrl: update.rgPhotoUrl,
    status: "COMPLETED",
    completedAt: now,
    updatedAt: now,

    age: update.age,
    birthDate: update.birthDate,
    sex: update.sex,
    education: update.education,
    religion: update.religion,
    otherReligion:
      update.otherReligion,
    completionChurch:
      update.completionChurch,
    completionOtherChurch:
      update.completionOtherChurch,
    completionEmail:
      update.completionEmail,
    completionPhone:
      update.completionPhone,
    address: update.address,
    neighborhood: update.neighborhood,
    city: update.city,
    otherCity: update.otherCity,
    cep: update.cep,
    completionFoodRestriction:
      update.completionFoodRestriction,
    otherFoodRestriction:
      update.otherFoodRestriction,
    specialMedication:
      update.specialMedication,
    otherSpecialMedication:
      update.otherSpecialMedication,
  };
}