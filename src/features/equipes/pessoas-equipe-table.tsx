"use client";

import Link from "next/link";
import {
  Eye,
  Pencil,
} from "lucide-react";

import type {
  PessoaEquipe,
} from "@/features/equipes/pessoas-equipe-repository";

type Props = {
  pessoas: PessoaEquipe[];
};

export function PessoasEquipeTable({
  pessoas,
}: Props) {
  if (!pessoas.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <h2 className="text-xl font-black">
          Nenhuma pessoa cadastrada
        </h2>

        <p className="mt-2 text-sm text-white/55">
          Cadastre uma pessoa para depois vinculá-la a uma equipe.
        </p>

        <Link
          href="/admin/equipe-pessoas/nova"
          className="mt-6 inline-flex rounded-xl bg-pink-400 px-5 py-3 text-sm font-black text-slate-950"
        >
          Cadastrar pessoa
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5">
      <table className="w-full min-w-[850px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/45">
            <th className="px-5 py-4">Nome</th>
            <th className="px-5 py-4">WhatsApp</th>
            <th className="px-5 py-4">E-mail</th>
            <th className="px-5 py-4">Cadastro</th>
            <th className="px-5 py-4 text-right">Ações</th>
          </tr>
        </thead>

        <tbody>
          {pessoas.map((pessoa) => (
            <tr
              key={pessoa.id}
              className="border-b border-white/5 last:border-b-0"
            >
              <td className="px-5 py-5">
                <p className="font-bold text-white">
                  {pessoa.name}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  {pessoa.registeredByName || "Cadastro administrativo"}
                </p>
              </td>

              <td className="px-5 py-5 text-sm text-white/65">
                {pessoa.whatsapp || "—"}
              </td>

              <td className="px-5 py-5 text-sm text-white/65">
                {pessoa.email || "—"}
              </td>

              <td className="px-5 py-5">
                <StatusBadge
                  status={pessoa.registrationStatus}
                />
              </td>

              <td className="px-5 py-5">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/equipe-pessoas/${encodeURIComponent(
                      pessoa.id,
                    )}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-cyan-500/15 px-3 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/25"
                  >
                    <Eye className="h-4 w-4" />
                    Abrir
                  </Link>

                  <Link
                    href={`/admin/equipe-pessoas/${encodeURIComponent(
                      pessoa.id,
                    )}/editar`}
                    className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white/15 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const config =
    status === "COMPLETED"
      ? {
          label: "Completo",
          className:
            "bg-emerald-400/10 text-emerald-300",
        }
      : status === "PENDING"
        ? {
            label: "Pendente",
            className:
              "bg-amber-400/10 text-amber-300",
          }
        : {
            label: "Sem cadastro",
            className:
              "bg-white/10 text-white/55",
          };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}