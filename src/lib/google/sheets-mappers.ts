import type {
  RegistrationGroup,
  RegistrationGuest,
} from "@/types/registration";

function nullable(value: unknown) {
  return value ?? "";
}

export function mapGroupToSheetRow(
  group: RegistrationGroup,
  comprovanteDriveUrl: string,
) {
  return [
    group.groupId,
    group.email,
    group.sponsor.id,
    group.sponsor.name,
    group.sponsor.whatsapp,
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

export function mapSponsorToSheetRow(
  group: RegistrationGroup,
) {
  return [
    group.sponsor.id,
    group.groupId,
    group.email,
    group.sponsor.name,
    group.sponsor.whatsapp,
    group.guests.length,
    group.guests.filter(
      (guest) => guest.completionStatus === "COMPLETED",
    ).length,
    "",
    group.createdAt,
    group.updatedAt,
    group.status === "ACTIVE" ? "ACTIVE" : "DELETED",
  ];
}

export function mapGuestToSheetRow(
  group: RegistrationGroup,
  guest: RegistrationGuest,
) {
  return [
    guest.id,
    group.groupId,
    group.sponsor.id,
    guest.church,
    nullable(guest.otherChurchName),
    guest.guestProfile,
    guest.guestName,
    guest.guestWhatsapp,
    guest.adoptiveParentsName,
    guest.adoptiveParentsWhatsapp,
    nullable(guest.foodRestriction),
    nullable(guest.personPhotoUrl),
    nullable(guest.rgPhotoUrl),
    JSON.stringify(guest.futureFields),
    guest.inviteeToken,
    guest.completionStatus,
    nullable(guest.completedAt),
    group.createdAt,
    group.updatedAt,
    "ACTIVE",
  ];
}

export function mapFileToSheetRow(
  group: RegistrationGroup,
  file: {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    driveFileId: string | null;
    driveUrl: string | null;
    category: "PIX_RECEIPT" | "GUEST_PHOTO" | "RG_PHOTO";
    guestId: string | null;
  },
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