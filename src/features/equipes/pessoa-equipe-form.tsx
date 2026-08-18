"use client";

import {
  useState,
  type FormEvent,
} from "react";
import {
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";

import { EjcButton } from "@/components/ui/ejc-button";
import { TextInput } from "@/components/forms/text-input";

export default function PessoaEquipeForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [observations, setObservations] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Informe um e-mail válido.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        "/api/admin/equipe-pessoas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            whatsapp: whatsapp.trim(),
            email: email.trim(),
            observations: observations.trim(),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível cadastrar a pessoa.",
        );
      }

      setSuccess(true);

      window.setTimeout(() => {
        router.push("/admin/equipe-pessoas");
        router.refresh();
      }, 700);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível cadastrar a pessoa.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
          Pessoas da equipe
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Nova pessoa
        </h1>

        <p className="mt-3 text-sm text-white/60">
          Cadastre uma pessoa para depois vinculá-la a uma equipe.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          Pessoa cadastrada com sucesso. Voltando para a lista...
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-black text-white">
          Dados da pessoa
        </h2>

        <div className="mt-6 grid gap-5">
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

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/90">
              Observações
            </span>

            <textarea
              value={observations}
              onChange={(event) =>
                setObservations(event.target.value)
              }
              rows={5}
              placeholder="Informações adicionais sobre a pessoa."
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-300/50"
            />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <EjcButton
          type="submit"
          disabled={saving}
          className="sm:min-w-52"
        >
          {saving ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              <Save className="h-4 w-4" />
              Cadastrar pessoa
            </span>
          )}
        </EjcButton>
      </div>
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