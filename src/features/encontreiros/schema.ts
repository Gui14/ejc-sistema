import { z } from "zod";

const phoneRegex =
  /^\+?[\d\s().-]{10,20}$/;

export const maxFileSize =
  10 * 1024 * 1024;

export const allowedPixFileTypes = [
  "image/png",
  "image/jpeg",
  "application/pdf",
] as const;

export const encontreiroSchema =
  z
    .object({
      name: z
        .string()
        .trim()
        .min(
          3,
          "Informe o nome completo.",
        ),

      whatsapp: z
        .string()
        .trim()
        .min(
          10,
          "Informe um WhatsApp válido.",
        )
        .regex(
          phoneRegex,
          "Informe um WhatsApp válido.",
        ),

      email: z
        .string()
        .trim()
        .email(
          "Informe um e-mail válido.",
        ),

      birthDate: z
        .string()
        .trim()
        .min(
          1,
          "Informe a data de nascimento.",
        ),

      sex: z.enum(
        ["MALE", "FEMALE"],
        {
          message: "Selecione o sexo.",
        },
      ),

      church: z.enum(
        ["NONE", "TEOSPOLIS", "OTHER"],
        {
          message: "Selecione a igreja.",
        },
      ),

      otherChurch: z
        .string()
        .trim()
        .optional(),

      city: z.enum(
        ["ITABUNA", "OTHER"],
        {
          message: "Selecione a cidade.",
        },
      ),

      otherCity: z
        .string()
        .trim()
        .optional(),

      observations: z
        .string()
        .trim()
        .max(
          1000,
          "As observações devem ter no máximo 1000 caracteres.",
        )
        .optional(),
    })
    .superRefine((data, context) => {
      if (
        data.church === "OTHER" &&
        !data.otherChurch?.trim()
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["otherChurch"],
          message:
            "Informe o nome da outra igreja.",
        });
      }

      if (
        data.city === "OTHER" &&
        !data.otherCity?.trim()
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["otherCity"],
          message:
            "Informe o nome da cidade.",
        });
      }
    });

export type EncontreiroFormData =
  z.infer<typeof encontreiroSchema>;