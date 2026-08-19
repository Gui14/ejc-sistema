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

const guestProfileSchema = z.union([
  z.enum([
    "TEO_MEMBER_OR_ATTENDEE",
    "NON_EVANGELICAL",
    "OTHER_EVANGELICAL_CHURCH",
  ]),
  z.literal(""),
]);

export const guestSchema = z
  .object({
    guestProfile: guestProfileSchema,

    otherChurchName: z.string().trim().optional(),

    guestName: z
      .string()
      .trim()
      .min(3, "Informe o nome completo do convidado."),

    guestWhatsapp: requiredPhone,

    sponsorName: z
      .string()
      .trim()
      .min(1, "Informe o nome dos pais adotivos."),

    sponsorWhatsapp: requiredPhone,
  })
  .superRefine((guest, context) => {
    if (guest.guestProfile === "") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["guestProfile"],
        message: "Selecione o perfil do convidado.",
      });
    }

    if (
      guest.guestProfile === "OTHER_EVANGELICAL_CHURCH" &&
      (!guest.otherChurchName || guest.otherChurchName.trim().length < 2)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherChurchName"],
        message: "Informe o nome da igreja.",
      });
    }
  });

const pixReceiptSchema = z.custom<FileList | undefined>().optional();

export const registrationSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe o nome da pessoa responsável."),

  guests: z
    .array(guestSchema)
    .min(1, "Adicione pelo menos um convidado.")
    .max(
      maxGuestCount,
      `Você pode cadastrar no máximo ${maxGuestCount} convidados.`,
    ),

  pixReceipt: pixReceiptSchema,
});

export const inviteeCompletionSchema = z
  .object({
    age: z
      .coerce
      .number({ message: "Informe sua idade." })
      .int("Informe uma idade inteira.")
      .min(1, "Informe uma idade válida.")
      .max(120, "Informe uma idade válida."),

    birthDate: z.string().trim().min(1, "Informe sua data de nascimento."),

    sex: z.enum(["MALE", "FEMALE"], {
      message: "Selecione o sexo.",
    }),

    education: z.enum(
      [
        "ELEMENTARY",
        "HIGH_SCHOOL",
        "INCOMPLETE_HIGHER",
        "COMPLETE_HIGHER",
      ],
      { message: "Selecione sua escolaridade." },
    ),

    religion: z.enum(
      [
        "NONE",
        "CATHOLIC",
        "UNBAPTIZED_CHRISTIAN",
        "EVANGELICAL",
        "OTHER",
      ],
      { message: "Selecione sua religião." },
    ),

    otherReligion: z.string().trim().optional(),

    church: z.enum(["NONE", "TEOSPOLIS", "OTHER"], {
      message: "Selecione a igreja.",
    }),

    otherChurch: z.string().trim().optional(),

    email: z.string().trim().email("Informe um e-mail válido."),

    phone: requiredPhone,

    address: z.string().trim().min(3, "Informe seu endereço."),

    neighborhood: z.string().trim().min(2, "Informe seu bairro."),

    city: z.enum(["ITABUNA", "OTHER"], {
      message: "Selecione sua cidade.",
    }),

    otherCity: z.string().trim().optional(),

    cep: z.string().trim().min(8, "Informe um CEP válido."),

    foodRestriction: z.enum(["NONE", "OTHER"], {
      message: "Selecione a restrição alimentar.",
    }),

    otherFoodRestriction: z.string().trim().optional(),

    specialMedication: z.enum(["NONE", "OTHER"], {
      message: "Selecione a medicação especial.",
    }),

    otherSpecialMedication: z.string().trim().optional(),

    personPhoto: z
      .custom<FileList>(
        (value) => typeof FileList !== "undefined" && value instanceof FileList,
        { message: "Envie uma foto do convidado." },
      )
      .refine((files) => files.length === 1, {
        message: "Envie uma foto do convidado.",
      })
      .refine(
        (files) => ["image/png", "image/jpeg"].includes(files.item(0)?.type ?? ""),
        { message: "A foto deve estar em PNG ou JPG." },
      )
      .refine((files) => (files.item(0)?.size ?? 0) <= maxFileSize, {
        message: "A foto deve ter no máximo 10 MB.",
      }),

    rgPhoto: z
      .custom<FileList>(
        (value) => typeof FileList !== "undefined" && value instanceof FileList,
        { message: "Envie uma foto do RG." },
      )
      .refine((files) => files.length === 1, {
        message: "Envie uma foto do RG.",
      })
      .refine(
        (files) =>
          ["image/png", "image/jpeg", "application/pdf"].includes(
            files.item(0)?.type ?? "",
          ),
        { message: "O RG deve estar em PNG, JPG ou PDF." },
      )
      .refine((files) => (files.item(0)?.size ?? 0) <= maxFileSize, {
        message: "O RG deve ter no máximo 10 MB.",
      }),
  })
  .superRefine((data, context) => {
    if (data.religion === "OTHER" && !data.otherReligion) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherReligion"],
        message: "Informe sua religião.",
      });
    }

    if (data.church === "OTHER" && !data.otherChurch) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherChurch"],
        message: "Informe o nome da igreja.",
      });
    }

    if (data.city === "OTHER" && !data.otherCity) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherCity"],
        message: "Informe o nome da cidade.",
      });
    }

    if (data.foodRestriction === "OTHER" && !data.otherFoodRestriction) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherFoodRestriction"],
        message: "Informe a restrição alimentar.",
      });
    }

    if (data.specialMedication === "OTHER" && !data.otherSpecialMedication) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherSpecialMedication"],
        message: "Informe a medicação especial.",
      });
    }
  });

export type GuestFormData = z.infer<typeof guestSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type InviteeCompletionData = z.infer<typeof inviteeCompletionSchema>;
export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationOutput = z.output<typeof registrationSchema>;