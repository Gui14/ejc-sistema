"use client";

import {
  useState,
} from "react";
import Link from "next/link";
import {
  Eye,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";

import type {
  Equipe,
} from "@/features/equipes/equipes-repository";

type Props = {
  equipes: EquipeComQuantidade[];
};

export function EquipesTable({
  equipes,
}: Props) {
  const router = useRouter();

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function handleDelete(
    equipe: Equipe,
  ) {
    const confirmed = window.confirm(
      `Deseja excluir a equipe "${equipe.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(equipe.id);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/equipes/${encodeURIComponent(
          equipe.id,
        )}`,
        {
          method: "DELETE",
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível excluir a equipe.",
        );
      }

      router.refresh();
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível excluir a equipe.";

      setError(message);
      window.alert(message);
    } finally {
      setDeletingId(null);
    }
  }

  if (!equipes.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <h2 className="text-xl font-black">
          Nenhuma equipe cadastrada
        </h2>

        <p className="mt-2 text-sm text-white/55">
          Crie a primeira equipe para começar a organizar os trabalhadores.
        </p>

        <Link
          href="/admin/equipes/nova"
          className="mt-6 inline-flex rounded-xl bg-pink-400 px-5 py-3 text-sm font-black text-slate-950"
        >
          Criar equipe
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/45">
              <th className="px-5 py-4">Equipe</th>
              <th className="px-5 py-4">Pessoas</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Criada em</th>
              <th className="px-5 py-4 text-right">Ações</th>
            </tr>
          </thead>

          <tbody>
            {equipes.map((equipe) => {
              const isDeleting =
                deletingId === equipe.id;

              const isActive =
                equipe.status === "ACTIVE";

              return (
                <tr
                  key={equipe.id}
                  className="border-b border-white/5 last:border-b-0"
                >
                  <td className="px-5 py-5">
                    <p className="font-bold text-white">
                      {equipe.name}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {equipe.id}
                    </p>
                  </td>

                  <td className="px-5 py-5">
                    <span className="inline-flex rounded-full bg-cyan-400/10 px-3 py-1 text-sm font-bold text-cyan-200">
                      {equipe.quantidadePessoas} pessoa
                      {equipe.quantidadePessoas === 1 ? "" : "s"}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                        isActive
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-white/10 text-white/55",
                      ].join(" ")}
                    >
                      {isActive
                        ? "Ativa"
                        : "Inativa"}
                    </span>
                  </td>

                  <td className="px-5 py-5 text-sm text-white/60">
                    {formatDate(
                      equipe.createdAt,
                    )}
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/equipes/${encodeURIComponent(
                          equipe.id,
                        )}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-cyan-500/15 px-3 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/25"
                      >
                        <Eye className="h-4 w-4" />
                        Abrir
                      </Link>

                      <Link
                        href={`/admin/equipes/${encodeURIComponent(
                          equipe.id,
                        )}/editar`}
                        className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white/15 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Link>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() =>
                          handleDelete(equipe)
                        }
                        className="inline-flex items-center gap-1 rounded-xl bg-red-500/15 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
    },
  ).format(date);
}

type EquipeComQuantidade = Equipe & {
  quantidadePessoas: number;
};