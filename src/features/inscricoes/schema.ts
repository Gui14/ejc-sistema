import { z } from "zod";

const phoneRegex = /^\+?[\d\s().-]{10,20}$/;

export const maxFileSize = 10 * 1024 * 1024;
export const maxFileCount = 10;
export const maxGuestCount = 10;

export const allowedFileTypes = [
  "image/png",
  "image/jpeg",
  "application/pdf",
] as const;

const requiredPhone = z
  .string()
  .trim()
  .min(10, "Informe um telefone válido.")
  .regex(phoneRegex, "Informe um telefone válido.");

export const guestProfileOptions = [
  {
    value: "TEO_MEMBER_OR_ATTENDEE",
    label: "Membro ou Congregado da TEO",
    pixAmount: 80,
  },
  {
    value: "NON_EVANGELICAL",
    label: "Não Evangélico",
    pixAmount: 80,
  },
  {
    value: "OTHER_EVANGELICAL_CHURCH",
    label: "Membro ou Congregado de outra igreja Evangélica",
    pixAmount: 100,
  },
] as const;

export const guestSchema = z
  .object({
    church: z.enum(["TEOSOPOLIS", "OTHER"], {
      message: "Selecione a igreja.",
    }),

    otherChurchName: z.string().trim().optional(),

    guestProfile: z.enum(
      [
        "TEO_MEMBER_OR_ATTENDEE",
        "NON_EVANGELICAL",
        "OTHER_EVANGELICAL_CHURCH",
      ],
      {
        message: "Selecione o perfil do convidado.",
      },
    ),

    guestName: z
      .string()
      .trim()
      .min(3, "Informe o nome completo do convidado."),

    guestWhatsapp: requiredPhone,

    adoptiveParentsName: z
      .string()
      .trim()
      .min(3, "Informe o nome dos pais adotivos."),

    adoptiveParentsWhatsapp: requiredPhone,
  })
  .superRefine((guest, context) => {
    if (
      guest.church === "OTHER" &&
      (!guest.otherChurchName || guest.otherChurchName.trim().length < 2)
    ) {
      context.addIssue({
        code: "custom",
        path: ["otherChurchName"],
        message: "Informe o nome da igreja.",
      });
    }
  });

/**
 * O arquivo é controlado pelo estado selectedPixFiles
 * no componente do formulário.
 *
 * Por isso, nesta etapa, o campo é opcional no schema.
 * A obrigatoriedade, quantidade, tipo e tamanho são
 * validados diretamente no registration-form.tsx.
 */
const pixReceiptSchema = z
  .custom<FileList | undefined>()
  .optional();

export const registrationSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("Informe um e-mail válido."),

  sponsorName: z
    .string()
    .trim()
    .min(3, "Informe o nome completo do padrinho."),

  sponsorWhatsapp: requiredPhone,

  guests: z
    .array(guestSchema)
    .min(1, "Adicione pelo menos um convidado.")
    .max(
      maxGuestCount,
      `Você pode cadastrar no máximo ${maxGuestCount} convidados.`,
    ),

  pixReceipt: pixReceiptSchema,
});

export const inviteeCompletionSchema = z.object({
  foodRestriction: z
    .string()
    .trim()
    .min(1, "Informe a questão alimentar."),

  personPhoto: z
    .custom<FileList>(
      (value) =>
        typeof FileList !== "undefined" && value instanceof FileList,
      {
        message: "Envie uma foto do convidado.",
      },
    )
    .refine((files) => files.length === 1, {
      message: "Envie uma foto do convidado.",
    })
    .refine(
      (files) =>
        ["image/png", "image/jpeg"].includes(
          files.item(0)?.type ?? "",
        ),
      {
        message: "A foto deve estar em PNG ou JPG.",
      },
    )
    .refine(
      (files) => (files.item(0)?.size ?? 0) <= maxFileSize,
      {
        message: "A foto deve ter no máximo 10 MB.",
      },
    ),

  rgPhoto: z
    .custom<FileList>(
      (value) =>
        typeof FileList !== "undefined" && value instanceof FileList,
      {
        message: "Envie uma foto do RG.",
      },
    )
    .refine((files) => files.length === 1, {
      message: "Envie uma foto do RG.",
    })
    .refine(
      (files) =>
        ["image/png", "image/jpeg", "application/pdf"].includes(
          files.item(0)?.type ?? "",
        ),
      {
        message: "O RG deve estar em PNG, JPG ou PDF.",
      },
    )
    .refine(
      (files) => (files.item(0)?.size ?? 0) <= maxFileSize,
      {
        message: "O RG deve ter no máximo 10 MB.",
      },
    ),
});

export type GuestFormData = z.infer<typeof guestSchema>;

export type RegistrationFormData = z.infer<
  typeof registrationSchema
>;

export type InviteeCompletionData = z.infer<
  typeof inviteeCompletionSchema
>;