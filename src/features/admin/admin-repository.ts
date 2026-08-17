import {
  appendSheetRow,
  getSheetRows,
  getSheetsClient,
  getSpreadsheetId,
  updateSheetRow,
} from "@/lib/google/sheets";

import {
  clearSheetCache,
} from "@/lib/google/sheets";


type SheetRow = string[];

function getValue(row: SheetRow, index: number) {
  return row[index] ?? "";
}

export type AdminGroupRecord = {
  groupId: string;
  email: string;
  sponsorId: string;
  sponsorName: string;
  sponsorWhatsapp: string;
  guestCount: number;
  expectedAmount: number;
  pixStatus: string;
  approvedAmount: number;
  receiptUrl: string;
  groupStatus: string;
  createdAt: string;
  updatedAt: string;
  recordStatus: string;
};

export type AdminGuestRecord = {
  id: string;
  groupId: string;
  sponsorId: string;
  church: string;
  otherChurch: string;
  profile: string;
  name: string;
  whatsapp: string;
  foodRestriction: string;
  personPhotoUrl: string;
  rgPhotoUrl: string;
  completionStatus: string;
  completedAt: string;
  recordStatus: string;
};

function parseNumber(value: string) {
  const normalized = value
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getAdminGroups() {
  const rows = await getSheetRows("Inscricoes");

  return rows
    .slice(1)
    .filter((row) => getValue(row, 13) !== "DELETED")
    .map<AdminGroupRecord>((row) => ({
      groupId: getValue(row, 0),
      email: getValue(row, 1),
      sponsorId: getValue(row, 2),
      sponsorName: getValue(row, 3),
      sponsorWhatsapp: getValue(row, 4),
      guestCount: Number(getValue(row, 5)) || 0,
      expectedAmount: parseNumber(getValue(row, 6)),
      pixStatus: getValue(row, 7),
      approvedAmount: parseNumber(getValue(row, 8)),
      receiptUrl: getValue(row, 9),
      groupStatus: getValue(row, 10),
      createdAt: getValue(row, 11),
      updatedAt: getValue(row, 12),
      recordStatus: getValue(row, 13),
    }));
}

export type PixStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

export async function updateGroupPixStatus(
  group: AdminGroupRecord,
  status: PixStatus,
  approvedAmount?: number,
) {
  const rows = await getSheetRows("Inscricoes");

  const rowIndex = rows.findIndex(
    (row) => getValue(row, 0) === group.groupId,
  );

  if (rowIndex < 1) {
    throw new Error("Inscrição não encontrada.");
  }

  const currentRow = rows[rowIndex];
  const updatedRow = [...currentRow];

  updatedRow[7] = status;
  updatedRow[8] =
    status === "APPROVED"
      ? String(approvedAmount ?? group.approvedAmount ?? 0)
      : "0";
  updatedRow[12] = new Date().toISOString();

  await updateSheetRow(
    "Inscricoes",
    rowIndex + 1,
    updatedRow,
  );

  return {
    ...group,
    pixStatus: status,
    approvedAmount:
      status === "APPROVED"
        ? approvedAmount ?? group.approvedAmount
        : 0,
    updatedAt: updatedRow[12],
  };
}

export async function deleteGroup(
  group: AdminGroupRecord,
) {
  return deleteRegistrationCascade(group.groupId);
}

export async function getAdminGuests() {
  const rows = await getSheetRows("Convidados");

  return rows
    .slice(1)
    .filter((row) => getValue(row, 19) !== "DELETED")
    .map<AdminGuestRecord>((row) => ({
      id: getValue(row, 0),
      groupId: getValue(row, 1),
      sponsorId: getValue(row, 2),
      church: getValue(row, 3),
      otherChurch: getValue(row, 4),
      profile: getValue(row, 5),
      name: getValue(row, 6),
      whatsapp: getValue(row, 7),
      foodRestriction: getValue(row, 10),
      personPhotoUrl: getValue(row, 11),
      rgPhotoUrl: getValue(row, 12),
      completionStatus: getValue(row, 15),
      completedAt: getValue(row, 16),
      recordStatus: getValue(row, 19),
      registrationUrl: getValue(row, 14),
    }));
}

export async function getAdminSummary() {
  const [groups, guests] = await Promise.all([
    getAdminGroups(),
    getAdminGuests(),
  ]);

  const activeGuests = guests.filter(
    (guest) => guest.recordStatus !== "DELETED",
  );

  const completedGuests = activeGuests.filter(
    (guest) => guest.completionStatus === "COMPLETED",
  );

  const expectedAmount = groups.reduce(
    (total, group) => total + group.expectedAmount,
    0,
  );

  const approvedAmount = groups.reduce(
    (total, group) => total + group.approvedAmount,
    0,
  );

  const pendingPix = groups.filter(
    (group) => group.pixStatus === "PENDING_REVIEW",
  ).length;

  const conversionRate =
    activeGuests.length === 0
      ? 0
      : (completedGuests.length / activeGuests.length) * 100;

  return {
    totalGroups: groups.length,
    totalGuests: activeGuests.length,
    completedGuests: completedGuests.length,
    pendingGuests: activeGuests.length - completedGuests.length,
    expectedAmount,
    approvedAmount,
    pendingPix,
    conversionRate,
  };
}

function getCell(
  row: SheetRow,
  index: number,
) {
  return row[index] ?? "";
}

export async function deleteRegistrationCascade(
  groupId: string,
) {
  const [
    inscriptionRows,
    sponsorRows,
    guestRows,
  ] = await Promise.all([
    getSheetRows("Inscricoes"),
    getSheetRows("Padrinhos"),
    getSheetRows("Convidados"),
  ]);

  const inscriptionRowIndex = inscriptionRows.findIndex(
    (row) => getCell(row, 0) === groupId,
  );

  if (inscriptionRowIndex < 1) {
    throw new Error("Inscrição não encontrada.");
  }

  const inscriptionRow = inscriptionRows[inscriptionRowIndex];

  const sponsorIds = new Set<string>();
  const guestIds = new Set<string>();

  const groupSponsorId = getCell(inscriptionRow, 2);

  if (groupSponsorId) {
    sponsorIds.add(groupSponsorId);
  }

  for (let index = 1; index < sponsorRows.length; index += 1) {
    const row = sponsorRows[index];

    const rowGroupId = getCell(row, 1);
    const sponsorId = getCell(row, 0);

    if (
      rowGroupId === groupId &&
      sponsorId
    ) {
      sponsorIds.add(sponsorId);
    }
  }

  for (let index = 1; index < guestRows.length; index += 1) {
    const row = guestRows[index];

    const guestId = getCell(row, 0);
    const rowGroupId = getCell(row, 1);
    const rowSponsorId = getCell(row, 2);

    if (
      rowGroupId === groupId ||
      sponsorIds.has(rowSponsorId)
    ) {
      if (guestId) {
        guestIds.add(guestId);
      }
    }
  }

  const updatedAt = new Date().toISOString();

  const updatedInscriptionRow = [
    ...inscriptionRow,
  ];

  updatedInscriptionRow[10] = "DELETED";
  updatedInscriptionRow[12] = updatedAt;
  updatedInscriptionRow[13] = "DELETED";

  const updateRequests: Array<{
    range: string;
    values: SheetRow[];
  }> = [
    {
      range: `Inscricoes!A${inscriptionRowIndex + 1}:N${inscriptionRowIndex + 1}`,
      values: [updatedInscriptionRow],
    },
  ];

  for (let index = 1; index < sponsorRows.length; index += 1) {
    const row = sponsorRows[index];

    const sponsorId = getCell(row, 0);
    const rowGroupId = getCell(row, 1);

    if (
      sponsorIds.has(sponsorId) &&
      rowGroupId === groupId
    ) {
      const updatedRow = [...row];

      updatedRow[9] = updatedAt;
      updatedRow[10] = "DELETED";

      updateRequests.push({
        range: `Padrinhos!A${index + 1}:K${index + 1}`,
        values: [updatedRow],
      });
    }
  }

  for (let index = 1; index < guestRows.length; index += 1) {
    const row = guestRows[index];

    const guestId = getCell(row, 0);
    const rowGroupId = getCell(row, 1);
    const rowSponsorId = getCell(row, 2);

    if (
      guestIds.has(guestId) ||
      rowGroupId === groupId ||
      sponsorIds.has(rowSponsorId)
    ) {
      const updatedRow = [...row];

      updatedRow[18] = updatedAt;
      updatedRow[19] = "DELETED";

      updateRequests.push({
        range: `Convidados!A${index + 1}:AM${index + 1}`,
        values: [updatedRow],
      });
    }
  }

  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: updateRequests,
    },
  });

  return {
    groupId,
    sponsorIds: Array.from(sponsorIds),
    guestIds: Array.from(guestIds),
    deletedAt: updatedAt,
  };
}

export async function getAdminGroupDetails(
  groupId: string,
) {
  const [
    groups,
    guests,
    files,
  ] = await Promise.all([
    getAdminGroups(),
    getAdminGuests(),
    getSheetRows("Arquivos"),
  ]);

  const group = groups.find(
    (item) => item.groupId === groupId,
  );

  if (!group) {
    return null;
  }

  const groupGuests = guests.filter(
    (guest) =>
      guest.groupId === groupId &&
      guest.recordStatus !== "DELETED",
  );

  const groupFiles = files
    .slice(1)
    .filter((row) => {
      const rowGroupId = getValue(row, 1);
      const status = getValue(row, 10);

      return (
        rowGroupId === groupId &&
        status !== "DELETED"
      );
    })
    .map((row) => ({
      fileId: getValue(row, 0),
      groupId: getValue(row, 1),
      guestId: getValue(row, 2),
      type: getValue(row, 3),
      originalName: getValue(row, 4),
      mimeType: getValue(row, 5),
      size: Number(getValue(row, 6)) || 0,
      driveFileId: getValue(row, 7),
      driveUrl: getValue(row, 8),
      createdAt: getValue(row, 9),
      status: getValue(row, 10),
    }));

  return {
    group,
    guests: groupGuests,
    files: groupFiles,
  };
}

type EditableGuestData = {
  church: string;
  otherChurch: string;
  profile: string;
  name: string;
  whatsapp: string;
  adoptiveParentsName: string;
  adoptiveParentsWhatsapp: string;
};

type EditableGroupData = {
  email: string;
  sponsorName: string;
  sponsorWhatsapp: string;
  guests: EditableGuestData[];
};

export async function updateRegistrationGroup(
  groupId: string,
  data: EditableGroupData,
) {
  const [
    inscriptionRows,
    sponsorRows,
    guestRows,
  ] = await Promise.all([
    getSheetRows("Inscricoes"),
    getSheetRows("Padrinhos"),
    getSheetRows("Convidados"),
  ]);

  const inscriptionIndex = inscriptionRows.findIndex(
    (row) => getCell(row, 0) === groupId,
  );

  if (inscriptionIndex < 1) {
    throw new Error("Inscrição não encontrada.");
  }

  const inscriptionRow = [
    ...inscriptionRows[inscriptionIndex],
  ];

  const sponsorId = getCell(inscriptionRow, 2);

  const relatedGuestIndexes = guestRows
    .map((row, index) => ({
      row,
      index,
    }))
    .filter(
      ({ row, index }) =>
        index > 0 &&
        getCell(row, 1) === groupId &&
        getCell(row, 19) !== "DELETED",
    );

  if (
    data.guests.length !== relatedGuestIndexes.length
  ) {
    throw new Error(
      "A quantidade de convidados não pode ser alterada nesta tela.",
    );
  }

  const totalAmount = data.guests.reduce(
    (total, guest) => {
      return (
        total +
        (guest.profile === "OTHER_EVANGELICAL_CHURCH"
          ? 100
          : 80)
      );
    },
    0,
  );

  const now = new Date().toISOString();

  inscriptionRow[1] = data.email;
  inscriptionRow[3] = data.sponsorName;
  inscriptionRow[4] = data.sponsorWhatsapp;
  inscriptionRow[5] = String(data.guests.length);
  inscriptionRow[6] = String(totalAmount);
  inscriptionRow[12] = now;

  const updateRequests: Array<{
    range: string;
    values: string[][];
  }> = [
    {
      range: `Inscricoes!A${inscriptionIndex + 1}:N${inscriptionIndex + 1}`,
      values: [inscriptionRow],
    },
  ];

  const sponsorIndex = sponsorRows.findIndex(
    (row, index) =>
      index > 0 &&
      getCell(row, 0) === sponsorId &&
      getCell(row, 1) === groupId,
  );

  if (sponsorIndex > 0) {
    const sponsorRow = [...sponsorRows[sponsorIndex]];

    sponsorRow[2] = data.email;
    sponsorRow[3] = data.sponsorName;
    sponsorRow[4] = data.sponsorWhatsapp;
    sponsorRow[5] = String(data.guests.length);
    sponsorRow[9] = now;

    updateRequests.push({
      range: `Padrinhos!A${sponsorIndex + 1}:K${sponsorIndex + 1}`,
      values: [sponsorRow],
    });
  }

  relatedGuestIndexes.forEach(
    ({ row, index }, guestIndex) => {
      const guestData = data.guests[guestIndex];
      const guestRow = [...row];

      guestRow[3] = guestData.church;
      guestRow[4] = guestData.otherChurch;
      guestRow[5] = guestData.profile;
      guestRow[6] = guestData.name;
      guestRow[7] = guestData.whatsapp;
      guestRow[8] = guestData.adoptiveParentsName;
      guestRow[9] =
        guestData.adoptiveParentsWhatsapp;
      guestRow[18] = now;

      updateRequests.push({
        range: `Convidados!A${index + 1}:T${index + 1}`,
        values: [guestRow],
      });
    },
  );

  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: updateRequests,
    },
  });

  return getAdminGroupDetails(groupId);
}

export async function getAdminGuestById(
  guestId: string,
) {
  const rows =
    await getSheetRows("Convidados");

  const rowIndex = rows.findIndex(
    (row, index) =>
      index > 0 &&
      getCell(row, 0) === guestId &&
      getCell(row, 19) !== "DELETED",
  );

  if (rowIndex < 1) {
    return null;
  }

  const row = rows[rowIndex];

  return {
    id: getCell(row, 0),
    groupId: getCell(row, 1),
    sponsorId: getCell(row, 2),

    church: getCell(row, 3),
    otherChurch: getCell(row, 4),
    profile: getCell(row, 5),
    name: getCell(row, 6),
    phone: getCell(row, 7),
    whatsapp: getCell(row, 7),

    adoptiveParentsName: getCell(
      row,
      8,
    ),

    adoptiveParentsWhatsapp: getCell(
      row,
      9,
    ),

    foodRestriction: getCell(
      row,
      10,
    ),

    personPhotoUrl: getCell(
      row,
      11,
    ),

    rgPhotoUrl: getCell(
      row,
      12,
    ),

    futureFields: getCell(
      row,
      13,
    ),

    token: getCell(row, 14),
    completionStatus: getCell(
      row,
      15,
    ),

    completedAt: getCell(
      row,
      16,
    ),

    createdAt: getCell(
      row,
      17,
    ),

    updatedAt: getCell(
      row,
      18,
    ),

    recordStatus: getCell(
      row,
      19,
    ),

    // U
    age: getCell(row, 20),

    // V
    birthDate: getCell(row, 21),

    // W
    sex: getCell(row, 22),

    // X
    education: getCell(row, 23),

    // Y
    religion: getCell(row, 24),

    // Z
    otherReligion: getCell(row, 25),

    // AA
    completionChurch: getCell(
      row,
      26,
    ),

    // AB
    completionOtherChurch: getCell(
      row,
      27,
    ),

    // AC
    completionEmail: getCell(
      row,
      28,
    ),

    // AD
    completionPhone: getCell(
      row,
      29,
    ),

    // AE
    address: getCell(row, 30),

    // AF
    neighborhood: getCell(
      row,
      31,
    ),

    // AG
    city: getCell(row, 32),

    // AH
    otherCity: getCell(row, 33),

    // AI
    cep: getCell(row, 34),

    // AJ
    completionFoodRestriction:
      getCell(row, 35),

    // AK
    otherFoodRestriction: getCell(
      row,
      36,
    ),

    // AL
    specialMedication: getCell(
      row,
      37,
    ),

    // AM
    otherSpecialMedication: getCell(
      row,
      38,
    ),
  };
}

type AdminGuestUpdate = {
  church?: string;
  otherChurch?: string;
  profile?: string;
  name?: string;
  whatsapp?: string;
  adoptiveParentsName?: string;
  adoptiveParentsWhatsapp?: string;
  foodRestriction?: string;
  completionStatus?: string;
};

export async function updateAdminGuest(
  guestId: string,
  data: {
    name: string;
    phone: string;

    age: string;
    birthDate: string;
    sex: string;
    education: string;
    religion: string;
    otherReligion: string;

    church: string;
    otherChurch: string;
    completionOtherChurch: string

    email: string;
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
  },
) {
  const rows =
    await getSheetRows("Convidados");

  const rowIndex = rows.findIndex(
    (row, index) =>
      index > 0 &&
      getCell(row, 0) === guestId &&
      getCell(row, 19) !== "DELETED",
  );

  if (rowIndex < 1) {
    throw new Error(
      "Convidado não encontrado.",
    );
  }

  const currentRow = [
    ...rows[rowIndex],
  ];

  /*
   * Garante que a linha tenha todas as
   * 39 colunas, de A até AM.
   */
  while (currentRow.length < 39) {
    currentRow.push("");
  }

  // Cadastro inicial
  currentRow[6] = data.name;
  currentRow[7] = data.phone;

  // Atualização administrativa
  currentRow[18] =
    new Date().toISOString();

  currentRow[20] = data.age;
  currentRow[21] = data.birthDate;
  currentRow[22] = data.sex;
  currentRow[23] = data.education;
  currentRow[24] = data.religion;
  currentRow[25] =
    data.otherReligion;

  currentRow[26] = data.church;
  currentRow[27] =
    data.completionOtherChurch;

  currentRow[28] = data.email;
  currentRow[29] =
    data.completionPhone;

  currentRow[30] = data.address;
  currentRow[31] =
    data.neighborhood;
  currentRow[32] = data.city;
  currentRow[33] =
    data.otherCity;
  currentRow[34] = data.cep;

  currentRow[35] =
    data.completionFoodRestriction;
  currentRow[36] =
    data.otherFoodRestriction;

  currentRow[37] =
    data.specialMedication;
  currentRow[38] =
    data.otherSpecialMedication;

  await updateSheetRow(
    "Convidados",
    rowIndex + 1,
    currentRow,
  );

  clearSheetCache("Convidados");

  return getAdminGuestById(
    guestId,
  );
}

export async function updateGuestFileLinks(
  guestId: string,
  data: {
    personPhotoUrl?: string;
    rgPhotoUrl?: string;
  },
) {
  const rows = await getSheetRows("Convidados");

  const rowIndex = rows.findIndex(
    (row) => getCell(row, 0) === guestId,
  );

  if (rowIndex < 1) {
    throw new Error("Convidado não encontrado.");
  }

  const currentRow = [...rows[rowIndex]];

  if (data.personPhotoUrl !== undefined) {
    currentRow[11] = data.personPhotoUrl;
  }

  if (data.rgPhotoUrl !== undefined) {
    currentRow[12] = data.rgPhotoUrl;
  }

  currentRow[18] = new Date().toISOString();

  await updateSheetRow(
    "Convidados",
    rowIndex + 1,
    currentRow,
  );

  return getAdminGuestById(guestId);
}

export async function appendAdminFileRecord(
  data: {
    fileId: string;
    groupId: string;
    guestId: string;
    type: "GUEST_PHOTO" | "RG_PHOTO";
    originalName: string;
    mimeType: string;
    size: number;
    driveFileId: string;
    driveUrl: string;
    createdAt: string;
  },
) {
  await appendSheetRow("Arquivos", [
    data.fileId,
    data.groupId,
    data.guestId,
    data.type,
    data.originalName,
    data.mimeType,
    data.size,
    data.driveFileId,
    data.driveUrl,
    data.createdAt,
    "ACTIVE",
  ]);
}

export async function softDeleteGuest(
  guestId: string,
) {
  const rows = await getSheetRows("Convidados");

  const rowIndex = rows.findIndex(
    (row) => getCell(row, 0) === guestId,
  );

  if (rowIndex < 1) {
    throw new Error("Convidado não encontrado.");
  }

  const updatedRow = [
    ...rows[rowIndex],
  ];

  /*
   * Ajuste estes índices conforme os cabeçalhos
   * reais da aba Convidados.
   */
  updatedRow[19] = "DELETED";
  updatedRow[18] = new Date().toISOString();

  await updateSheetRow(
    "Convidados",
    rowIndex + 1,
    updatedRow,
  );

  await softDeleteGuest(guestId);
}

export async function softDeleteGuestFiles(
  guestId: string,
) {
  const rows = await getSheetRows("Arquivos");

  const guestIdColumn = 2;
  const statusColumn = 10;
  const updatedAtColumn = 11;

  const updates: Array<{
    rowNumber: number;
    values: string[][];
  }> = [];

  rows.forEach((row, index) => {
    if (index === 0) {
      return;
    }

    if (getCell(row, guestIdColumn) !== guestId) {
      return;
    }

    const updatedRow = [...row];

    updatedRow[statusColumn] = "DELETED";
    updatedRow[updatedAtColumn] =
      new Date().toISOString();

    updates.push({
      rowNumber: index + 1,
      values: [updatedRow],
    });
  });

  for (const update of updates) {
    await updateSheetRow(
      "Arquivos",
      update.rowNumber,
      update.values[0],
    );
  }
}

function mapGuestRow(value: any[], index: number, array: any[][]): unknown {
  throw new Error("Function not implemented.");
}

export type AdminSponsor = {
  id: string;
  name: string;
  phone: string;
  createdBy: string;
  guests: AdminSponsorGuest[];
};

const GUEST_SPONSOR_ID_COLUMN = 2;
const GUEST_ID_COLUMN = 0;
const GUEST_NAME_COLUMN = 6;
const GUEST_PHONE_COLUMN = 7;
const GUEST_TOKEN_COLUMN = 14;
const GUEST_COMPLETION_STATUS_COLUMN = 15;
const GUEST_REGISTRY_STATUS_COLUMN = 19;

const SPONSOR_ID_COLUMN = 0;
const SPONSOR_NAME_COLUMN = 3;
const SPONSOR_PHONE_COLUMN = 4;
const SPONSOR_CREATED_BY_COLUMN = 2;
const SPONSOR_REGISTRY_STATUS_COLUMN = 10;

export async function getAdminSponsors(): Promise<
  AdminSponsor[]
> {
  const sponsorRows =
    await getSheetRows("Padrinhos");

  const guestRows =
    await getSheetRows("Convidados");

  const activeSponsors = sponsorRows
    .slice(1)
    .filter((row) => {
      const sponsorStatus = getCell(
        row,
        SPONSOR_REGISTRY_STATUS_COLUMN,
      );

      return sponsorStatus !== "DELETED";
    });

  return activeSponsors.map((sponsorRow) => {
    const sponsorId = getCell(
      sponsorRow,
      SPONSOR_ID_COLUMN,
    );

    const guests = guestRows
      .slice(1)
      .filter((guestRow) => {
        const guestSponsorId = getCell(
          guestRow,
          GUEST_SPONSOR_ID_COLUMN,
        );

        const guestStatus = getCell(
          guestRow,
          GUEST_REGISTRY_STATUS_COLUMN,
        );

        return (
          guestSponsorId === sponsorId &&
          guestStatus !== "DELETED"
        );
      })
      .map((guestRow) => {
        const guestId = getCell(
          guestRow,
          GUEST_ID_COLUMN,
        );

        const guestName = getCell(
          guestRow,
          GUEST_NAME_COLUMN,
        );

        const guestPhone = getCell(
          guestRow,
          GUEST_PHONE_COLUMN,
        );

        const token = getCell(
          guestRow,
          GUEST_TOKEN_COLUMN,
        );

        const completionStatus = getCell(
          guestRow,
          GUEST_COMPLETION_STATUS_COLUMN,
        );

        return {
          id: guestId,
          name: guestName,
          phone: guestPhone,
          registrationToken: token,
          registrationUrl:
            buildGuestRegistrationUrl(token),
          completed:
            completionStatus === "COMPLETED",
        };
      });

    return {
      id: sponsorId,
      name: getCell(
        sponsorRow,
        SPONSOR_NAME_COLUMN,
      ),
      phone: getCell(
        sponsorRow,
        SPONSOR_PHONE_COLUMN,
      ),
      createdBy: getCell(
        sponsorRow,
        SPONSOR_CREATED_BY_COLUMN,
      ),
      guests,
    };
  });
}



export type AdminSponsorGuest = {
  id: string;
  name: string;
  phone: string;
  registrationToken: string;
  registrationUrl: string;
  completed: boolean;
};

function buildGuestRegistrationUrl(
  token: string,
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  return `${baseUrl}/convidado/${encodeURIComponent(
    token,
  )}`;
}

export async function getAdminSponsorById(
  sponsorId: string,
) {
  const rows =
    await getSheetRows("Padrinhos");

  const row = rows.find(
    (row, index) =>
      index > 0 &&
      getCell(row, 0) === sponsorId &&
      getCell(row, 10) !== "DELETED",
  );

  if (!row) {
    return null;
  }

  return {
    id: getCell(row, 0),
    name: getCell(row, 3),
    phone: getCell(row, 4),
    createdBy: getCell(row, 2),
  };
}

export async function softDeleteSponsor(
  sponsorId: string,
) {
  const rows =
    await getSheetRows("Padrinhos");

  const rowIndex = rows.findIndex(
    (row, index) =>
      index > 0 &&
      getCell(row, 0) === sponsorId,
  );

  if (rowIndex < 1) {
    throw new Error(
      "Pai adotivo não encontrado.",
    );
  }

  const updatedRow = [
    ...rows[rowIndex],
  ];

  // Coluna I: status_registro
  updatedRow[10] = "DELETED";

  await updateSheetRow(
    "Padrinhos",
    rowIndex + 1,
    updatedRow,
  );
  clearSheetCache("Padrinhos");
}

export type AdminGuest = {
  id: string;
  groupId: string;
  sponsorId: string;
  sponsorName: string;
  name: string;
  phone: string;
  profile: string;
  otherChurchName: string;
  status: string;
  registrationToken: string;
  registrationUrl: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

const GUEST_GROUP_ID_COLUMN = 1;
const GUEST_PROFILE_COLUMN = 5;
const GUEST_OTHER_CHURCH_COLUMN = 4;
const GUEST_CREATED_AT_COLUMN = 17;
const GUEST_UPDATED_AT_COLUMN = 18;

export async function getAdminGuestsbetter(): Promise<
  AdminGuest[]
> {
  const guestRows =
    await getSheetRows("Convidados");

  const sponsorRows =
    await getSheetRows("Padrinhos");

  const sponsorMap = new Map<
    string,
    string
  >();

  sponsorRows
    .slice(1)
    .filter(
      (row) =>
        getCell(row, 10) !== "DELETED",
    )
    .forEach((row) => {
      sponsorMap.set(
        getCell(row, 0),
        getCell(row, 3),
      );
    });

  return guestRows
    .slice(1)
    .filter(
      (row) =>
        getCell(
          row,
          GUEST_REGISTRY_STATUS_COLUMN,
        ) !== "DELETED",
    )
    .map((row) => {
      const guestId = getCell(
        row,
        GUEST_ID_COLUMN,
      );

      const token = getCell(
        row,
        GUEST_TOKEN_COLUMN,
      );

      const completionStatus = getCell(
        row,
        GUEST_COMPLETION_STATUS_COLUMN,
      );

      return {
        id: guestId,
        groupId: getCell(
          row,
          GUEST_GROUP_ID_COLUMN,
        ),
        sponsorId: getCell(
          row,
          GUEST_SPONSOR_ID_COLUMN,
        ),
        sponsorName:
          sponsorMap.get(
            getCell(
              row,
              8,
            ),
          ) ?? "Sem padrinho",
        name: getCell(
          row,
          GUEST_NAME_COLUMN,
        ),
        phone: getCell(
          row,
          GUEST_PHONE_COLUMN,
        ),
        profile: getCell(
          row,
          GUEST_PROFILE_COLUMN,
        ),
        otherChurchName: getCell(
          row,
          GUEST_OTHER_CHURCH_COLUMN,
        ),
        status: completionStatus,
        registrationToken: token,
        registrationUrl:
          buildGuestRegistrationUrl(token),
        completed:
          completionStatus === "COMPLETED",
        createdAt: getCell(
          row,
          GUEST_CREATED_AT_COLUMN,
        ),
        updatedAt: getCell(
          row,
          GUEST_UPDATED_AT_COLUMN,
        ),
      };
    });
}