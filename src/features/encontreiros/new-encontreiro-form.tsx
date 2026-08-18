"use client";

import {
  useState,
  type FormEvent,
} from "react";

import { useRouter } from "next/navigation";

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

export function NewEncontreiroForm() {
  const router = useRouter();

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

  const [error, setError] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  function validateForm() {
    if (!name.trim()) {
      return "Informe o nome completo.";
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

    try {
      const response = await fetch(
        "/api/admin/encontreiros",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            whatsapp: whatsapp.trim(),
            email: email.trim(),
            birthDate,
            sex,
            church,
            otherChurch:
              otherChurch.trim(),
            city,
            otherCity:
              otherCity.trim(),
            observations:
              observations.trim(),
          }),
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível criar o encontreiro.",
        );
      }

      router.push(
        "/admin/encontreiros",
      );
      router.refresh();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Não foi possível criar o encontreiro.",
      );
    } finally {
      setSaving(false);
    }
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
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-pink-300/50"
            />
          </label>
        </div>
      </section>

      <EjcButton
        type="submit"
        disabled={saving}
        className="w-full"
      >
        {saving
          ? "Salvando..."
          : "Cadastrar encontreiro"}
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
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-pink-300/50"
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