import type {
  GuestFormData,
  RegistrationFormData,
} from "@/features/inscricoes/schema";

export type RegistrationDraft = RegistrationFormData;

export type DriveFileCategory =
  | "PIX_RECEIPT"
  | "GUEST_PHOTO"
  | "RG_PHOTO"
  | "ENCONTREIRO_PIX";

export type RegistrationFile = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  driveFileId: string | null;
  driveUrl: string | null;
  category: DriveFileCategory;
  guestId: string | null;
};

export type RegistrationGuest = GuestFormData & {
  id: string;
  groupId: string;
  inviteeToken: string;
  church: string | null;
  completionStatus: "PENDING" | "COMPLETED";
  foodRestriction: string | null;
  personPhotoUrl: string | null;
  rgPhotoUrl: string | null;
  futureFields: Record<string, unknown>;
  completedAt: string | null;
};

export type RegistrationSponsor = {
  id: string;
  name: string;
  whatsapp: string;
};

export type RegistrationGroup = {
  groupId: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  sponsor: RegistrationSponsor;
  guests: RegistrationGuest[];
  pixReceipts: RegistrationFile[];
  totalAmount: number;
  pixStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  status: "ACTIVE" | "DELETED";
};