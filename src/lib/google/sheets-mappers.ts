import type {
  RegistrationFile,
  RegistrationGroup,
  RegistrationGuest,
} from "@/types/registration";

function nullable(value: unknown) {
  return value ?? "";
}

function normalizeSponsorName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function getUniqueSponsorNames(guests: RegistrationGuest[]) {
  const names = new Map<string, string>();

  for (const guest of guests) {
    const sponsorName = normalizeSponsorName(guest.sponsorName);

    if (!sponsorName) continue;

    const key = sponsorName.toLocaleLowerCase("pt-BR");
    if (!names.has(key)) names.set(key, sponsorName);
  }

  return Array.from(names.values());
}

function getFirstSponsorWhatsapp(guests: RegistrationGuest[]) {
  return guests.find(
    (guest) => guest.sponsorWhatsapp.trim().length > 0,
  )?.sponsorWhatsapp ?? "";
}

export function mapGroupToSheetRow(
  group: RegistrationGroup,
  comprovanteDriveUrl: string,
) {
  const sponsorNames = getUniqueSponsorNames(group.guests);

  return [
    group.groupId,
    group.email,
    group.sponsor.id,
    sponsorNames.join(", "),
    getFirstSponsorWhatsapp(group.guests),
    group.guests.length,
    group.totalAmount,
    group.pixStatus,
    "",
    comprovanteDriveUrl,
    group.status,
    group.createdAt,
    group.updatedAt,
    group.status === "ACTIVE" ? "ACTIVE" : "DELETED",
  ];
}

export function mapGuestToSheetRow(
  group: RegistrationGroup,
  guest: RegistrationGuest,
) {
  const completion = guest.futureFields ?? {};

  return [
    guest.id,
    group.groupId,
    group.sponsor.id,
    nullable(guest.church),
    nullable(guest.otherChurchName),
    guest.guestProfile,
    guest.guestName,
    guest.guestWhatsapp,
    guest.sponsorName,
    guest.sponsorWhatsapp,
    nullable(guest.foodRestriction),
    nullable(guest.personPhotoUrl),
    nullable(guest.rgPhotoUrl),
    JSON.stringify(completion),
    guest.inviteeToken,
    guest.completionStatus,
    nullable(guest.completedAt),
    group.createdAt,
    group.updatedAt,
    "ACTIVE",
    nullable(completion.age),
    nullable(completion.birthDate),
    nullable(completion.sex),
    nullable(completion.education),
    nullable(completion.religion),
    nullable(completion.otherReligion),
    nullable(completion.church),
    nullable(completion.otherChurch),
    nullable(completion.email),
    nullable(completion.phone),
    nullable(completion.address),
    nullable(completion.neighborhood),
    nullable(completion.city),
    nullable(completion.otherCity),
    nullable(completion.cep),
    nullable(completion.foodRestriction),
    nullable(completion.otherFoodRestriction),
    nullable(completion.specialMedication),
    nullable(completion.otherSpecialMedication),
  ];
}

export function mapFileToSheetRow(
  group: RegistrationGroup,
  file: RegistrationFile,
) {
  return [
    file.id,
    group.groupId,
    file.guestId ?? "",
    file.category,
    file.originalName,
    file.mimeType,
    file.size,
    file.driveFileId ?? "",
    file.driveUrl ?? "",
    group.createdAt,
    "ACTIVE",
  ];
}

export function mapSponsorToSheetRow(
  group: RegistrationGroup,
) {
  const sponsorNames = getUniqueSponsorNames(
    group.guests,
  );

  return [
    group.sponsor.id,
    group.groupId,
    group.email,
    sponsorNames.join(", "),
    getFirstSponsorWhatsapp(group.guests),
    group.guests.length,
    group.guests.filter(
      (guest) =>
        guest.completionStatus === "COMPLETED",
    ).length,
    "",
    group.createdAt,
    group.updatedAt,
    group.status === "ACTIVE"
      ? "ACTIVE"
      : "DELETED",
  ];
}