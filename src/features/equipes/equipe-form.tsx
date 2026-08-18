"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  CheckCircle2,
  Loader2,
  Save,
  X,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";

import { EjcButton } from "@/components/ui/ejc-button";
import { TextInput } from "@/components/forms/text-input";

export type EquipeFormStatus =
  | "ACTIVE"
  | "INACTIVE";

export type EquipeFormData = {
  id?: string;
  name: string;
  description: string;
  status: EquipeFormStatus | string;
};

type Props = {
  equipe?: EquipeFormData;
  onSaved?: (equipe: EquipeFormData) => void;
  onCancel?: () => void;
};

function normalizeStatus(
  value?: string,
): EquipeFormStatus {
  return value === "INACTIVE"
    ? "INACTIVE"
    : "ACTIVE";
}

export function EquipeForm({
  equipe,
  onSaved,
  onCancel,
}: Props) {
  const router = useRouter();
  const isEditing = Boolean(equipe?.id);

  const [name, setName] = useState(
    equipe?.name ?? "",
  );
  const [description, setDescription] = useState(
    equipe?.description ?? "",
  );
  const [status, setStatus] = useState<EquipeFormStatus>(
    normalizeStatus(equipe?.status),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setName(equipe?.name ?? "");
    setDescription(equipe?.description ?? "");
    setStatus(normalizeStatus(equipe?.status));
    setError(null);
    setSuccess(false);
  }, [equipe]);

  function validateForm() {
    if (!name.trim()) {
      return "Informe o nome da equipe.";
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

    const payload = {
      name: name.trim(),
      description: description.trim(),
      status,
    };

    try {
      const endpoint = isEditing
        ? `/api/admin/equipes/${encodeURIComponent(
            equipe!.id!,
          )}`
        : "/api/admin/equipes";

      const response = await fetch(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível salvar a equipe.",
        );
      }

      setSuccess(true);

      if (result.equipe) {
        onSaved?.(result.equipe);
      }

      window.setTimeout(() => {
        router.push("/admin/equipes");
        router.refresh();
      }, 700);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível salvar a equipe.",
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Equipes
          </p>

          <h1 className="mt-2 text-3xl font-black text-white">
            {isEditing ? "Editar equipe" : "Nova equipe"}
          </h1>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl p-2 text-white/50 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Fechar formulário"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          Equipe salva com sucesso. Voltando para a lista...
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-black text-white">
          Dados da equipe
        </h2>

        <div className="mt-6 grid gap-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/90">
              Nome da equipe
            </span>
            <TextInput
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Liturgia"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/90">
              Descrição
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="Descreva a responsabilidade da equipe."
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-300/50"
            />
          </label>

          <label className="block max-w-sm">
            <span className="mb-2 block text-sm font-semibold text-white/90">
              Status
            </span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(normalizeStatus(event.target.value))
              }
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-300/50"
            >
              <option value="ACTIVE">Ativa</option>
              <option value="INACTIVE">Inativa</option>
            </select>
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            Cancelar
          </button>
        )}

        <EjcButton
          type="submit"
          disabled={saving}
          className="sm:min-w-48"
        >
          {saving ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              <Save className="h-4 w-4" />
              Salvar equipe
            </span>
          )}
        </EjcButton>
      </div>
    </form>
  );
}