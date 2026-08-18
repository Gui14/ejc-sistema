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
  UserPlus,
  X,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";

import { EjcButton } from "@/components/ui/ejc-button";
import { TextInput } from "@/components/forms/text-input";

type PessoaEquipeOption = {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
};

type Props = {
  equipeId: string;
  onSaved?: () => void;
  onCancel?: () => void;
};

type Mode = "EXISTING" | "NEW";

export function MembroEquipeForm({
  equipeId,
  onSaved,
  onCancel,
}: Props) {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>(
    "EXISTING",
  );

  const [pessoas, setPessoas] = useState<
    PessoaEquipeOption[]
  >([]);
  const [pessoaEquipeId, setPessoaEquipeId] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [observations, setObservations] = useState("");
  const [role, setRole] = useState("");
  const [isCoordinator, setIsCoordinator] = useState(false);

  const [loadingPessoas, setLoadingPessoas] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadPessoas() {
      try {
        const response = await fetch(
          "/api/admin/equipe-pessoas",
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ??
              "Não foi possível carregar as pessoas.",
          );
        }

        setPessoas(result.pessoas ?? []);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar as pessoas.",
        );
      } finally {
        setLoadingPessoas(false);
      }
    }

    loadPessoas();
  }, []);

  function validateForm() {
    if (mode === "EXISTING" && !pessoaEquipeId) {
      return "Selecione uma pessoa.";
    }

    if (mode === "NEW") {
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
    }

    if (!role.trim()) {
      return "Informe a função na equipe.";
    }

    return null;
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError(null);

    if (nextMode === "EXISTING") {
      setName("");
      setWhatsapp("");
      setEmail("");
      setObservations("");
    } else {
      setPessoaEquipeId("");
    }
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
      const payload =
        mode === "NEW"
          ? {
              createPerson: true,
              name: name.trim(),
              whatsapp: whatsapp.trim(),
              email: email.trim(),
              observations: observations.trim(),
              role: role.trim(),
              isCoordinator,
            }
          : {
              createPerson: false,
              pessoaEquipeId,
              role: role.trim(),
              isCoordinator,
            };

      const response = await fetch(
        `/api/admin/equipes/${encodeURIComponent(
          equipeId,
        )}/membros`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível adicionar o membro.",
        );
      }

      setSuccess(true);
      onSaved?.();

      window.setTimeout(() => {
        router.push(
          `/admin/equipes/${encodeURIComponent(
            equipeId,
          )}`,
        );
        router.refresh();
      }, 700);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível adicionar o membro.",
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
            Membros da equipe
          </p>

          <h1 className="mt-2 text-3xl font-black text-white">
            Adicionar pessoa
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
          Pessoa adicionada à equipe com sucesso.
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-black text-white">
          Quem você deseja adicionar?
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => switchMode("EXISTING")}
            className={[
              "rounded-2xl border p-4 text-left transition",
              mode === "EXISTING"
                ? "border-cyan-300/50 bg-cyan-300/10"
                : "border-white/10 bg-white/5 hover:bg-white/10",
            ].join(" ")}
          >
            <span className="block text-sm font-black text-white">
              Pessoa já cadastrada
            </span>
            <span className="mt-1 block text-xs text-white/50">
              Escolher uma pessoa da lista.
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchMode("NEW")}
            className={[
              "rounded-2xl border p-4 text-left transition",
              mode === "NEW"
                ? "border-pink-300/50 bg-pink-300/10"
                : "border-white/10 bg-white/5 hover:bg-white/10",
            ].join(" ")}
          >
            <span className="block text-sm font-black text-white">
              Cadastrar nova pessoa
            </span>
            <span className="mt-1 block text-xs text-white/50">
              Criar a pessoa e adicioná-la agora.
            </span>
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        {mode === "EXISTING" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/90">
              Pessoa
            </span>

            <select
              value={pessoaEquipeId}
              onChange={(event) =>
                setPessoaEquipeId(event.target.value)
              }
              disabled={loadingPessoas || saving}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-300/50 disabled:opacity-50"
            >
              <option value="">
                {loadingPessoas
                  ? "Carregando pessoas..."
                  : "Selecione uma pessoa"}
              </option>

              {pessoas.map((pessoa) => (
                <option
                  key={pessoa.id}
                  value={pessoa.id}
                >
                  {pessoa.name}
                  {pessoa.whatsapp
                    ? ` — ${pessoa.whatsapp}`
                    : ""}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="grid gap-5">
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
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-300/50"
              />
            </label>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-black text-white">
          Dados do vínculo
        </h2>

        <div className="mt-5 grid gap-5">
          <Field
            label="Função na equipe"
            value={role}
            onChange={setRole}
          />

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4">
            <input
              type="checkbox"
              checked={isCoordinator}
              onChange={(event) =>
                setIsCoordinator(event.target.checked)
              }
              disabled={saving}
              className="h-4 w-4 accent-pink-400"
            />

            <span>
              <span className="block text-sm font-bold text-white">
                Esta pessoa é coordenadora
              </span>
              <span className="mt-1 block text-xs text-white/50">
                Marque se ela coordena essa equipe.
              </span>
            </span>
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
          disabled={saving || (mode === "EXISTING" && loadingPessoas)}
          className="sm:min-w-52"
        >
          {saving ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              <UserPlus className="h-4 w-4" />
              Adicionar à equipe
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