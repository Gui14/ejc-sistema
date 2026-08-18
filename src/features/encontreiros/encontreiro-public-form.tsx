"use client";

import {
  useState,
  type FormEvent,
} from "react";

import {
  CheckCircle2,
  FileText,
  UploadCloud,
} from "lucide-react";

import { EjcButton } from "@/components/ui/ejc-button";
import { TextInput } from "@/components/forms/text-input";

type Option = {
  value: string;
  label: string;
};

const sexOptions: Option[] = [
  {
    value: "MALE",
    label: "Masculino",
  },
  {
    value: "FEMALE",
    label: "Feminino",
  },
];

const churchOptions: Option[] = [
  {
    value: "NONE",
    label: "Nenhuma",
  },
  {
    value: "TEOSPOLIS",
    label: "Igreja Batista Teosópolis",
  },
  {
    value: "OTHER",
    label: "Outra",
  },
];

const cityOptions: Option[] = [
  {
    value: "ITABUNA",
    label: "Itabuna",
  },
  {
    value: "OTHER",
    label: "Outra",
  },
];

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const allowedPixTypes = [
  "image/png",
  "image/jpeg",
  "application/pdf",
];

export function EncontreiroPublicForm() {
  const [name, setName] =
    useState("");

  const [whatsapp, setWhatsapp] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [birthDate, setBirthDate] =
    useState("");

  const [sex, setSex] =
    useState("");

  const [church, setChurch] =
    useState("");

  const [otherChurch, setOtherChurch] =
    useState("");

  const [city, setCity] =
    useState("");

  const [otherCity, setOtherCity] =
    useState("");

  const [observations, setObservations] =
    useState("");

  const [pixReceipt, setPixReceipt] =
    useState<File | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  function validateForm() {
    if (!name.trim()) {
      return "Informe o nome.";
    }

    if (!whatsapp.trim()) {
      return "Informe o WhatsApp.";
    }

    if (!email.trim()) {
      return "Informe o e-mail.";
    }

    if (!birthDate) {
      return "Informe a data de nascimento.";
    }

    if (!sex) {
      return "Selecione o sexo.";
    }

    if (!church) {
      return "Selecione a igreja.";
    }

    if (
      church === "OTHER" &&
      !otherChurch.trim()
    ) {
      return "Informe a outra igreja.";
    }

    if (!city) {
      return "Selecione a cidade.";
    }

    if (
      city === "OTHER" &&
      !otherCity.trim()
    ) {
      return "Informe a outra cidade.";
    }

    if (!pixReceipt) {
      return "Envie o comprovante PIX.";
    }

    if (
      !allowedPixTypes.includes(
        pixReceipt.type,
      )
    ) {
      return "O comprovante deve ser PNG, JPG ou PDF.";
    }

    if (
      pixReceipt.size >
      MAX_FILE_SIZE
    ) {
      return "O comprovante deve ter no máximo 10 MB.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    const formData = new FormData();

    formData.append(
      "name",
      name.trim(),
    );

    formData.append(
      "whatsapp",
      whatsapp.trim(),
    );

    formData.append(
      "email",
      email.trim(),
    );

    formData.append(
      "birthDate",
      birthDate,
    );

    formData.append(
      "sex",
      sex,
    );

    formData.append(
      "church",
      church,
    );

    formData.append(
      "otherChurch",
      otherChurch.trim(),
    );

    formData.append(
      "city",
      city,
    );

    formData.append(
      "otherCity",
      otherCity.trim(),
    );

    formData.append(
      "observations",
      observations.trim(),
    );

    formData.append(
      "pixReceipt",
      pixReceipt!,
      pixReceipt!.name,
    );

    try {
      const response = await fetch(
        "/api/encontreiros",
        {
          method: "POST",
          body: formData,
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível enviar a inscrição.",
        );
      }

      setSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível enviar a inscrição.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="mt-8 rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-300" />

        <h2 className="mt-5 text-2xl font-black">
          Inscrição enviada!
        </h2>

        <p className="mt-3 text-white/70">
          Seu cadastro foi recebido e será analisado pela equipe do EJC.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6"
    >
      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-black">
          Dados pessoais
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field
            label="Nome completo"
            value={name}
            onChange={setName}
          />

          <Field
            label="WhatsApp"
            type="tel"
            value={whatsapp}
            onChange={setWhatsapp}
          />

          <Field
            label="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
          />

          <Field
            label="Data de nascimento"
            type="date"
            value={birthDate}
            onChange={setBirthDate}
          />

          <SelectField
            label="Sexo"
            value={sex}
            onChange={setSex}
            options={sexOptions}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-black">
          Igreja e cidade
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Igreja"
            value={church}
            onChange={setChurch}
            options={churchOptions}
          />

          {church === "OTHER" && (
            <Field
              label="Outra igreja"
              value={otherChurch}
              onChange={setOtherChurch}
            />
          )}

          <SelectField
            label="Cidade"
            value={city}
            onChange={setCity}
            options={cityOptions}
          />

          {city === "OTHER" && (
            <Field
              label="Outra cidade"
              value={otherCity}
              onChange={setOtherCity}
            />
          )}

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-white/90">
              Observações
            </span>

            <textarea
              value={observations}
              onChange={(event) =>
                setObservations(
                  event.target.value,
                )
              }
              rows={5}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-black">
          Comprovante PIX
        </h2>

        <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-pink-200/40 bg-white/5 p-4">
          <UploadCloud className="h-6 w-6 text-pink-200" />

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {pixReceipt?.name ??
                "Selecionar comprovante"}
            </span>

            <span className="mt-1 block text-xs text-white/50">
              PNG, JPG ou PDF — até 10 MB
            </span>
          </span>

          <FileText className="h-5 w-5 text-white/40" />

          <input
            type="file"
            className="sr-only"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={(event) =>
              setPixReceipt(
                event.target.files?.[0] ??
                  null,
              )
            }
          />
        </label>
      </section>

      <EjcButton
        type="submit"
        disabled={saving}
        className="w-full"
      >
        {saving
          ? "Enviando..."
          : "Enviar inscrição"}
      </EjcButton>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/90">
        {label}
      </span>

      <TextInput
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/90">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
      >
        <option value="">
          Selecione uma opção
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}