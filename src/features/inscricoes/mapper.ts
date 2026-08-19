import type {
  RegistrationDraft,
  RegistrationFile,
  RegistrationGroup,
  RegistrationGuest,
} from "@/types/registration";

import type { GuestFormData } from "./schema";

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function calculateGuestAmount(
  profile: GuestFormData["guestProfile"],
) {
  if (profile === "OTHER_EVANGELICAL_CHURCH") {
    return 100;
  }

  return 80;
}

function mapGuest(
  guest: GuestFormData,
  groupId: string,
): RegistrationGuest {
  return {
    ...guest,
    id: createId("guest"),
    groupId,
    inviteeToken: crypto.randomUUID(),
    completionStatus: "PENDING",
    church: null,
    foodRestriction: null,
    personPhotoUrl: null,
    rgPhotoUrl: null,
    futureFields: {},
    completedAt: null,
  };
}

function mapPixFiles(
  files: FileList | undefined,
): RegistrationFile[] {
  if (!files) {
    return [];
  }

  return Array.from(files).map((file) => ({
    id: createId("receipt"),
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    driveFileId: null,
    driveUrl: null,
    category: "PIX_RECEIPT" as const,
    guestId: null,
  }));
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function collectUniqueSponsorNames(
  guests: RegistrationGuest[],
) {
  const uniqueNames = new Map<string, string>();

  for (const guest of guests) {
    const name = normalizeName(guest.sponsorName);

    if (!name) {
      continue;
    }

    const normalizedKey = name.toLocaleLowerCase("pt-BR");

    if (!uniqueNames.has(normalizedKey)) {
      uniqueNames.set(normalizedKey, name);
    }
  }

  return Array.from(uniqueNames.values());
}

function createSponsorFromGuests(
  guests: RegistrationGuest[],
) {
  const sponsorNames = collectUniqueSponsorNames(guests);
  const firstGuestWithSponsor = guests.find(
    (guest) => normalizeName(guest.sponsorName).length > 0,
  );

  return {
    id: createId("sponsor"),
    name: sponsorNames.join(", "),
    whatsapp: firstGuestWithSponsor?.sponsorWhatsapp ?? "",
  };
}

export function createRegistrationGroup(
  data: RegistrationDraft,
): RegistrationGroup {
  const now = new Date().toISOString();
  const groupId = createId("group");

  const guests = data.guests.map((guest) =>
    mapGuest(guest, groupId),
  );

  const totalAmount = guests.reduce(
    (total, guest) =>
      total + calculateGuestAmount(guest.guestProfile),
    0,
  );

  return {
    groupId,
    createdAt: now,
    updatedAt: now,
    email: data.email,
    sponsor: createSponsorFromGuests(guests),
    guests,
    pixReceipts: mapPixFiles(data.pixReceipt),
    totalAmount,
    pixStatus: "PENDING_REVIEW",
    status: "ACTIVE",
  };
}