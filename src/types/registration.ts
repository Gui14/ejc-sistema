import type {
  GuestFormData,
  RegistrationFormData,
} from "@/features/inscricoes/schema";

export type RegistrationDraft = RegistrationFormData;

export type DriveFileCategory =
  | "PIX_RECEIPT"
  | "GUEST_PHOTO"
  | "RG_PHOTO";

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
  completionStatus: "PENDING" | "COMPLETED";
  foodRestriction: string | null;
  personPhotoUrl: string | null;
  rgPhotoUrl: string | null;
  futureFields: Record<string, unknown>;
  completedAt: string | null;
};

export type RegistrationGroup = {
  groupId: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  sponsor: {
    id: string;
    name: string;
    whatsapp: string;
  };
  guests: RegistrationGuest[];
  pixReceipts: RegistrationFile[];
  totalAmount: number;
  pixStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  status: "ACTIVE" | "DELETED";
};