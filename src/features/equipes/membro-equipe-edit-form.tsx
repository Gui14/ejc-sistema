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
  Trash2,
  UserRound,
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

type MembroEquipeData = {
  id: string;
  equipeId: string;
  pessoaEquipeId: string;
  encontreiroId: string;
  role: string;
  isCoordinator: boolean;
  linkStatus: string;
};

type Props = {
  equipeId: string;
  membro: MembroEquipeData;
  onSaved?: () => void;
  onCancel?: () => void;
};

export function MembroEquipeEditForm({
  equipeId,
  membro,
  onSaved,
  onCancel,
}: Props) {
  const router = useRouter();

  const [pessoas, setPessoas] = useState<
    PessoaEquipeOption[]
  >([]);
  const [pessoaEquipeId, setPessoaEquipeId] = useState(
    membro.pessoaEquipeId ?? "",
  );
  const [encontreiroId, setEncontreiroId] = useState(
    membro.encontreiroId ?? "",
  );
  const [role, setRole] = useState(
    membro.role ?? "",
  );
  const [isCoordinator, setIsCoordinator] = useState(
    membro.isCoordinator ?? false,
  );
  const [linkStatus, setLinkStatus] = useState<
    "ACTIVE" | "INACTIVE"
  >(
    membro.linkStatus === "INACTIVE"
      ? "INACTIVE"
      : "ACTIVE",
  );

  const [loadingPessoas, setLoadingPessoas] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setPessoaEquipeId(membro.pessoaEquipeId ?? "");
    setEncontreiroId(membro.encontreiroId ?? "");
    setRole(membro.role ?? "");
    setIsCoordinator(membro.isCoordinator ?? false);
    setLinkStatus(
      membro.linkStatus === "INACTIVE"
        ? "INACTIVE"
        : "ACTIVE",
    );
    setError(null);
    setSuccess(false);
  }, [membro]);

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
    if (!pessoaEquipeId) {
      return "Selecione uma pessoa.";
    }

    if (!role.trim()) {
      return "Informe a função na equipe.";
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
        `/api/admin/equipes/${encodeURIComponent(
          equipeId,
        )}/membros/${encodeURIComponent(
          membro.id,
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pessoaEquipeId,
            encontreiroId: encontreiroId.trim(),
            role: role.trim(),
            isCoordinator,
            linkStatus,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível atualizar o membro.",
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
          : "Não foi possível atualizar o membro.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Deseja remover esta pessoa da equipe?",
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/equipes/${encodeURIComponent(
          equipeId,
        )}/membros/${encodeURIComponent(
          membro.id,
        )}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível remover o membro.",
        );
      }

      router.push(
        `/admin/equipes/${encodeURIComponent(
          equipeId,
        )}`,
      );
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível remover o membro.",
      );
    } finally {
      setDeleting(false);
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
            Editar membro
          </h1>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving || deleting}
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
          Membro atualizado com sucesso. Voltando para a equipe...
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3">
          <UserRound className="h-6 w-6 text-cyan-200" />
          <h2 className="text-xl font-black text-white">
            Dados do vínculo
          </h2>
        </div>

        <div className="mt-6 grid gap-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/90">
              Pessoa
            </span>

            <select
              value={pessoaEquipeId}
              onChange={(event) =>
                setPessoaEquipeId(event.target.value)
              }
              disabled={loadingPessoas || saving || deleting}
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

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/90">
              ID do encontreiro, se houver
            </span>

            <TextInput
              value={encontreiroId}
              onChange={(event) =>
                setEncontreiroId(event.target.value)
              }
              placeholder="Opcional"
              disabled={saving || deleting}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/90">
              Função na equipe
            </span>

            <TextInput
              value={role}
              onChange={(event) =>
                setRole(event.target.value)
              }
              placeholder="Ex.: Coordenador, apoio, cozinha"
              disabled={saving || deleting}
            />
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4">
            <input
              type="checkbox"
              checked={isCoordinator}
              onChange={(event) =>
                setIsCoordinator(event.target.checked)
              }
              disabled={saving || deleting}
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

          <label className="block max-w-sm">
            <span className="mb-2 block text-sm font-semibold text-white/90">
              Status do vínculo
            </span>

            <select
              value={linkStatus}
              onChange={(event) =>
                setLinkStatus(
                  event.target.value as
                    | "ACTIVE"
                    | "INACTIVE",
                )
              }
              disabled={saving || deleting}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-300/50 disabled:opacity-50"
            >
              <option value="ACTIVE">
                Ativo
              </option>
              <option value="INACTIVE">
                Inativo
              </option>
            </select>
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving || deleting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/15 px-5 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Remover da equipe
        </button>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving || deleting}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              Cancelar
            </button>
          )}

          <EjcButton
            type="submit"
            disabled={saving || deleting || loadingPessoas}
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
                Salvar alterações
              </span>
            )}
          </EjcButton>
        </div>
      </div>
    </form>
  );
}