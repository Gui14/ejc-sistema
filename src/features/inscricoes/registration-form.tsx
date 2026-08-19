"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import { zodResolver } from "@hookform/resolvers/zod";



import type {
  SubmitHandler,
} from "react-hook-form";

import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import {
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { SelectInput } from "@/components/forms/select-input";
import { TextInput } from "@/components/forms/text-input";
import { EjcButton } from "@/components/ui/ejc-button";

import {
  allowedFileTypes,
  guestProfileOptions,
  maxFileCount,
  maxFileSize,
  maxGuestCount,
  registrationSchema,
  type RegistrationInput,
  type RegistrationOutput,
} from "./schema";


type GuestField = {
  guestProfile:
    | ""
    | "TEO_MEMBER_OR_ATTENDEE"
    | "NON_EVANGELICAL"
    | "OTHER_EVANGELICAL_CHURCH";

  otherChurchName?: string;
  guestName: string;
  guestWhatsapp: string;
  adoptiveParentsName: string;
  adoptiveParentsWhatsapp: string;
};

const emptyGuest: GuestField = {
  guestProfile: "",
  otherChurchName: "",
  guestName: "",
  guestWhatsapp: "",
  adoptiveParentsName: "",
  adoptiveParentsWhatsapp: "",
};

function getFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function createFileList(files: File[]) {
  const dataTransfer = new DataTransfer();

  files.forEach((file) => {
    dataTransfer.items.add(file);
  });

  return dataTransfer.files;
}

export function RegistrationForm() {
  const pixInputRef =
    useRef<HTMLInputElement>(null);

  const [submitted, setSubmitted] =
    useState(false);

  const [
    selectedPixFiles,
    setSelectedPixFiles,
  ] = useState<File[]>([]);

  const [
    pixFileError,
    setPixFileError,
  ] = useState<string | null>(null);

  const [
    pixPreviewUrls,
    setPixPreviewUrls,
  ] = useState<Record<string, string>>({});

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<
      RegistrationInput,
      unknown,
      RegistrationOutput
    >({
    resolver: zodResolver(
      registrationSchema,
    ),
    mode: "onBlur",
    defaultValues: {
      email: "",
      sponsorName: "",
      sponsorWhatsapp: "",
      guests: [emptyGuest],
      pixReceipt: undefined,
    },
  });

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "guests",
  });

  const guests =
    useWatch<
      RegistrationInput,
      "guests"
    >({
      control,
      name: "guests",
      defaultValue: [emptyGuest],
    });

  const totalAmount = useMemo(() => {
    return (guests ?? []).reduce<number>(
      (
        total: number,
        guest: GuestField,
      ) => {
        const option =
          guestProfileOptions.find(
            (item) =>
              item.value ===
              guest.guestProfile,
          );

        return (
          total + (option?.pixAmount ?? 0)
        );
      },
      0,
    );
  }, [guests]);

  useEffect(() => {
    const nextPreviewUrls: Record<
      string,
      string
    > = {};

    selectedPixFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        nextPreviewUrls[
          getFileKey(file)
        ] = URL.createObjectURL(file);
      }
    });

    setPixPreviewUrls(nextPreviewUrls);

    return () => {
      Object.values(nextPreviewUrls).forEach(
        (url) => {
          URL.revokeObjectURL(url);
        },
      );
    };
  }, [selectedPixFiles]);

  function setPixInputFiles(files: File[]) {
    if (pixInputRef.current) {
      pixInputRef.current.files =
        createFileList(files);
    }
  }

  function handlePixFilesChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const incomingFiles = Array.from(
      event.target.files ?? [],
    );

    if (incomingFiles.length === 0) {
      return;
    }

    const invalidType = incomingFiles.find(
      (file) =>
        !allowedFileTypes.includes(
          file.type as (typeof allowedFileTypes)[number],
        ),
    );

    if (invalidType) {
      setPixFileError(
        "Aceite apenas arquivos PNG, JPG, JPEG ou PDF.",
      );

      event.target.value = "";
      return;
    }

    const oversizedFile = incomingFiles.find(
      (file) => file.size > maxFileSize,
    );

    if (oversizedFile) {
      setPixFileError(
        "Cada arquivo deve ter no máximo 10 MB.",
      );

      event.target.value = "";
      return;
    }

    const mergedFiles = [
      ...selectedPixFiles,
      ...incomingFiles,
    ];

    const uniqueFiles = mergedFiles.filter(
      (file, index, files) =>
        files.findIndex(
          (currentFile) =>
            getFileKey(currentFile) ===
            getFileKey(file),
        ) === index,
    );

    if (
      uniqueFiles.length > maxFileCount
    ) {
      setPixFileError(
        `Você pode selecionar no máximo ${maxFileCount} arquivos.`,
      );
    } else {
      setPixFileError(null);
    }

    const limitedFiles =
      uniqueFiles.slice(0, maxFileCount);

    setSelectedPixFiles(limitedFiles);
    setPixInputFiles(limitedFiles);

    setValue(
      "pixReceipt",
      createFileList(limitedFiles),
      {
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: true,
      },
    );

    event.target.value = "";
  }

  function removePixFile(fileKey: string) {
    const remainingFiles =
      selectedPixFiles.filter(
        (file) =>
          getFileKey(file) !== fileKey,
      );

    setSelectedPixFiles(remainingFiles);
    setPixInputFiles(remainingFiles);
    setPixFileError(null);

    setValue(
      "pixReceipt",
      createFileList(remainingFiles),
      {
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: true,
      },
    );
  }

  function addGuest() {
    if (
      fields.length >= maxGuestCount
    ) {
      return;
    }

    append({
      ...emptyGuest,
    });
  }

  async function onSubmit(
    data: RegistrationOutput,
  ) {
    if (selectedPixFiles.length === 0) {
      setPixFileError(
        "Envie pelo menos um comprovante.",
      );

      return;
    }

    if (
      selectedPixFiles.length > maxFileCount
    ) {
      setPixFileError(
        `Você pode selecionar no máximo ${maxFileCount} arquivos.`,
      );

      return;
    }

    try {
      const formData = new FormData();

      const serializedData = {
        ...data,
        pixReceipt: undefined,
      };

      formData.append(
        "data",
        JSON.stringify(serializedData),
      );

      selectedPixFiles.forEach((file) => {
        formData.append(
          "pixReceipt",
          file,
          file.name,
        );
      });

      const response = await fetch(
        "/api/inscricoes",
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setPixFileError(
          result.error ??
            "Não foi possível criar a inscrição.",
        );

        return;
      }

      console.log(
        "Inscrição persistida:",
        result.group,
      );

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Erro ao enviar inscrição:",
        error,
      );

      setPixFileError(
        "Não foi possível conectar ao servidor.",
      );
    }
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-300" />

        <h2 className="mt-5 text-2xl font-black">
          Cadastro preparado!
        </h2>

        <p className="mt-3 text-white/70">
          A integração com o Google Sheets será adicionada na próxima etapa.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit as SubmitHandler<RegistrationInput>,
      )}
      className="space-y-8"
    >
      <section className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-200">
            Etapa 01
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Dados do cadastro
          </h2>

          <p className="mt-2 text-sm text-white/60">
            Informe o nome da pessoa responsável pela inscrição.
          </p>
        </div>

        <FormField
          label="Nome"
          error={errors.email?.message}
        >
          <TextInput
            type="text"
            placeholder="Digite seu nome completo"
            autoComplete="name"
            {...register("email")}
          />
        </FormField>
      </section>

     

      <section className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-200">
              Etapa 02
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Convidados
            </h2>

            <p className="mt-2 text-sm text-white/60">
              Cada convidado terá seu próprio cadastro e link de acesso.
            </p>
          </div>

          <EjcButton
            type="button"
            variant="secondary"
            onClick={addGuest}
            disabled={
              fields.length >= maxGuestCount
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar convidado
          </EjcButton>
        </div>

        {typeof errors.guests?.message ===
          "string" && (
          <p className="mb-4 text-sm text-pink-200">
            {errors.guests.message}
          </p>
        )}

        <div className="space-y-6">
          {fields.map((field, index) => {
            const selectedProfile =
              guests[index]?.guestProfile ??
              "";

            const selectedProfileData =
              guestProfileOptions.find(
                (option) =>
                  option.value ===
                  selectedProfile,
              );

            const showOtherChurch =
              selectedProfile ===
              "OTHER_EVANGELICAL_CHURCH";

            return (
              <div
                key={field.id}
                className="rounded-3xl border border-white/15 bg-black/10 p-5 sm:p-6"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
                      Convidado {index + 1}
                    </p>

                    <h3 className="mt-2 text-xl font-black">
                      Dados do encontrista
                    </h3>
                  </div>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        remove(index)
                      }
                      className="rounded-xl p-2 text-white/50 transition hover:bg-red-400/10 hover:text-red-200"
                      aria-label={`Remover convidado ${index + 1}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-5">
                  <FormField
                    label="Perfil do convidado"
                    error={
                      errors.guests?.[index]
                        ?.guestProfile
                        ?.message
                    }
                  >
                    <SelectInput
                      defaultValue=""
                      {...register(
                        `guests.${index}.guestProfile`,
                      )}
                    >
                      <option
                        value=""
                        disabled
                      >
                        Selecione uma opção
                      </option>

                      {guestProfileOptions.map(
                        (option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ),
                      )}
                    </SelectInput>
                  </FormField>

                  {showOtherChurch && (
                    <FormField
                      label="Nome da outra igreja"
                      error={
                        errors.guests?.[index]
                          ?.otherChurchName
                          ?.message
                      }
                    >
                      <TextInput
                        placeholder="Digite o nome da igreja"
                        {...register(
                          `guests.${index}.otherChurchName`,
                        )}
                      />
                    </FormField>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      label="Nome completo"
                      error={
                        errors.guests?.[index]
                          ?.guestName
                          ?.message
                      }
                    >
                      <TextInput
                        placeholder="Nome completo do convidado"
                        {...register(
                          `guests.${index}.guestName`,
                        )}
                      />
                    </FormField>

                    <FormField
                      label="WhatsApp"
                      error={
                        errors.guests?.[index]
                          ?.guestWhatsapp
                          ?.message
                      }
                    >
                      <TextInput
                        type="tel"
                        placeholder="(73) 99999-9999"
                        {...register(
                          `guests.${index}.guestWhatsapp`,
                        )}
                      />
                    </FormField>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-6">
                    <div className="mb-5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-200">
                        Dados dos pais adotivos
                      </p>

                      <p className="mt-2 text-sm text-white/60">
                        Essas informações são obrigatórias para este convidado.
                      </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        label="Nome dos pais adotivos"
                        error={
                          errors.guests?.[index]
                            ?.adoptiveParentsName
                            ?.message
                        }
                      >
                        <TextInput
                          placeholder="Nome completo"
                          {...register(
                            `guests.${index}.adoptiveParentsName`,
                          )}
                        />
                      </FormField>

                      <FormField
                        label="WhatsApp dos pais adotivos"
                        error={
                          errors.guests?.[index]
                            ?.adoptiveParentsWhatsapp
                            ?.message
                        }
                      >
                        <TextInput
                          type="tel"
                          placeholder="(73) 99999-9999"
                          {...register(
                            `guests.${index}.adoptiveParentsWhatsapp`,
                          )}
                        />
                      </FormField>
                    </div>
                  </div>

                  {selectedProfileData && (
                    <div className="rounded-2xl border border-pink-300/25 bg-pink-400/10 p-4">
                      <p className="text-sm text-white/70">
                        Valor previsto deste convidado
                      </p>

                      <p className="mt-1 text-2xl font-black text-pink-200">
                        {formatCurrency(
                          selectedProfileData.pixAmount,
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
          <p className="text-sm text-white/70">
            Valor total previsto
          </p>

          <p className="mt-1 text-3xl font-black text-cyan-100">
            {formatCurrency(totalAmount)}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-200">
            Etapa 03
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Comprovante do PIX
          </h2>

          <p className="mt-2 text-sm text-white/60">
            Envie os comprovantes referentes ao pagamento do grupo.
            Aceitamos PNG, JPG, JPEG ou PDF, com até 10 MB por arquivo.
          </p>
        </div>

        <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-pink-200/40 bg-white/5 p-6 text-center transition hover:bg-white/10">
          <UploadCloud className="h-10 w-10 text-pink-200" />

          <span className="mt-3 text-sm font-semibold">
            Clique para selecionar os comprovantes
          </span>

          <span className="mt-1 text-xs text-white/50">
            Até {maxFileCount} arquivos — máximo de 10 MB cada
          </span>

          <input
            ref={(element) => {
              pixInputRef.current = element;
              register("pixReceipt").ref(
                element,
              );
            }}
            name="pixReceipt"
            type="file"
            className="sr-only"
            accept=".png,.jpg,.jpeg,.pdf"
            multiple
            onBlur={
              register("pixReceipt").onBlur
            }
            onChange={handlePixFilesChange}
          />
        </label>

        {selectedPixFiles.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white">
                Arquivos selecionados
              </h3>

              <span className="text-xs text-white/50">
                {selectedPixFiles.length}/
                {maxFileCount}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {selectedPixFiles.map((file) => {
                const fileKey =
                  getFileKey(file);

                const previewUrl =
                  pixPreviewUrls[fileKey];

                const isImage =
                  file.type.startsWith(
                    "image/",
                  );

                return (
                  <div
                    key={fileKey}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 p-3"
                  >
                    {isImage &&
                    previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={`Prévia de ${file.name}`}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-pink-400/15">
                        <FileText className="h-7 w-7 text-pink-200" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-white/50">
                        {formatFileSize(
                          file.size,
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removePixFile(
                          fileKey,
                        )
                      }
                      className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
                      aria-label={`Remover ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {pixFileError && (
          <p className="mt-3 text-sm text-pink-200">
            {pixFileError}
          </p>
        )}

        {typeof errors.pixReceipt
          ?.message === "string" && (
          <p className="mt-3 text-sm text-pink-200">
            {errors.pixReceipt.message}
          </p>
        )}
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <EjcButton
          type="button"
          variant="secondary"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar
        </EjcButton>

        <EjcButton
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Enviando..."
            : "Inscrever"}
        </EjcButton>
      </div>
    </form>
  );
}