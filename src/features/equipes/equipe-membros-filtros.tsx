"use client";

import {
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  Pencil,
  Plus,
  Search,
  UserRound,
  Users,
} from "lucide-react";

export type EquipeMemberRow = {
  id: string;
  equipeId: string;
  name: string;
  whatsapp: string;
  email: string;
  role: string;
  isCoordinator: boolean;
  registrationStatus: string;
  pessoaEquipeId: string;
};

type Props = {
  equipeId: string;
  membros: EquipeMemberRow[];
};

type Filter =
  | "ALL"
  | "WITHOUT_REGISTRATION"
  | "PENDING"
  | "COMPLETED"
  | "COORDINATORS"
  | "MEMBERS";

const filters: {
  value: Filter;
  label: string;
}[] = [
  {
    value: "ALL",
    label: "Todos",
  },
  {
    value: "WITHOUT_REGISTRATION",
    label: "Sem cadastro",
  },
  {
    value: "PENDING",
    label: "Cadastro pendente",
  },
  {
    value: "COMPLETED",
    label: "Cadastro completo",
  },
  {
    value: "COORDINATORS",
    label: "Coordenadores",
  },
  {
    value: "MEMBERS",
    label: "Integrantes",
  },
];

export function EquipeMembrosFilters({
  equipeId,
  membros,
}: Props) {
  const [filter, setFilter] = useState<Filter>(
    "ALL",
  );
  const [search, setSearch] = useState("");

  const filteredMembros = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase();

    return membros.filter((membro) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          membro.name,
          membro.email,
          membro.whatsapp,
          membro.role,
        ].some((value) =>
          value
            .toLocaleLowerCase()
            .includes(normalizedSearch),
        );

      if (!matchesSearch) {
        return false;
      }

      if (filter === "ALL") {
        return true;
      }

      if (filter === "COORDINATORS") {
        return membro.isCoordinator;
      }

      if (filter === "MEMBERS") {
        return !membro.isCoordinator;
      }

      return (
        membro.registrationStatus ===
        filter
      );
    });
  }, [filter, membros, search]);

  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black">
            Pessoas da equipe
          </h2>

          <p className="mt-2 text-sm text-white/60">
            Filtre os membros por cadastro, função ou nome.
          </p>
        </div>

        <Link
          href={`/admin/equipes/${encodeURIComponent(
            equipeId,
          )}/membros/novo`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500/15 px-4 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-500/25"
        >
          <Plus className="h-4 w-4" />
          Adicionar membro
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Buscar por nome, e-mail, WhatsApp ou função"
            className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-pink-300/50"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {filters.map((item) => {
            const active =
              filter === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setFilter(item.value)
                }
                className={[
                  "rounded-xl px-3 py-2 text-xs font-bold transition",
                  active
                    ? "bg-pink-400 text-slate-950"
                    : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs text-white/45">
        <span className="inline-flex items-center gap-2">
          <Users className="h-4 w-4" />
          {filteredMembros.length} exibido(s)
        </span>

        <span className="inline-flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          {membros.length} total
        </span>
      </div>

      {!filteredMembros.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/45">
          Nenhum membro corresponde ao filtro selecionado.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/45">
                <th className="px-5 py-4">Pessoa</th>
                <th className="px-5 py-4">Contato</th>
                <th className="px-5 py-4">Função</th>
                <th className="px-5 py-4">Cadastro</th>
                <th className="px-5 py-4">Tipo</th>
                <th className="px-5 py-4 text-right">Ação</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembros.map((membro) => (
                <tr
                  key={membro.id}
                  className="border-b border-white/5 last:border-b-0"
                >
                  <td className="px-5 py-5">
                    <p className="font-bold text-white">
                      {membro.name}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {membro.email || "Sem e-mail"}
                    </p>
                  </td>

                  <td className="px-5 py-5 text-sm text-white/65">
                    {membro.whatsapp || "—"}
                  </td>

                  <td className="px-5 py-5 text-sm text-white/65">
                    {membro.role || "—"}
                  </td>

                  <td className="px-5 py-5">
                    <RegistrationBadge
                      status={membro.registrationStatus}
                    />
                  </td>

                  <td className="px-5 py-5">
                    {membro.isCoordinator ? (
                      <span className="rounded-full bg-pink-400/15 px-3 py-1 text-xs font-bold text-pink-200">
                        Coordenador
                      </span>
                    ) : (
                      <span className="text-xs text-white/45">
                        Integrante
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-5 text-right">
                    <Link
                      href={`/admin/equipes/${encodeURIComponent(
                        equipeId,
                      )}/membros/${encodeURIComponent(
                        membro.id,
                      )}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white/15 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function RegistrationBadge({
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