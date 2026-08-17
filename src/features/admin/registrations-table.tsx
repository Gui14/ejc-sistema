"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Search,
  SlidersHorizontal,
  Trash2,
  WalletCards,
} from "lucide-react";

import { TextInput } from "@/components/forms/text-input";

type AdminGroupRecord = {
  groupId: string;
  email: string;
  sponsorId: string;
  sponsorName: string;
  sponsorWhatsapp: string;
  guestCount: number;
  expectedAmount: number;
  pixStatus: string;
  approvedAmount: number;
  receiptUrl: string;
  groupStatus: string;
  createdAt: string;
  updatedAt: string;
  recordStatus: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getPixStatusLabel(status: string) {
  switch (status) {
    case "APPROVED":
      return "Aprovado";
    case "REJECTED":
      return "Rejeitado";
    case "PENDING_REVIEW":
      return "Pendente";
    default:
      return status || "-";
  }
}

function getPixStatusClass(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-400/15 text-emerald-200";
    case "REJECTED":
      return "bg-red-400/15 text-red-200";
    default:
      return "bg-amber-400/15 text-amber-200";
  }
}

export function RegistrationsTable() {
  const [groups, setGroups] = useState<AdminGroupRecord[]>([]);
  const [search, setSearch] = useState("");
  const [pixStatus, setPixStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(
    null,
    );

    const [processingGroupId, setProcessingGroupId] = useState<
    string | null
    >(null);

  useEffect(() => {
    async function loadGroups() {
      try {
        const response = await fetch("/api/admin/inscricoes");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ?? "Não foi possível carregar as inscrições.",
          );
        }

        setGroups(result.groups);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar as inscrições.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadGroups();
  }, []);

  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return groups.filter((group) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        group.groupId.toLowerCase().includes(normalizedSearch) ||
        group.email.toLowerCase().includes(normalizedSearch) ||
        group.sponsorName.toLowerCase().includes(normalizedSearch);

      const matchesPix =
        pixStatus === "ALL" ||
        group.pixStatus === pixStatus;

      return matchesSearch && matchesPix;
    });
  }, [groups, pixStatus, search]);
  async function changePixStatus(
  group: AdminGroupRecord,
) {
  const nextStatus =
    group.pixStatus === "APPROVED"
      ? "PENDING_REVIEW"
      : "APPROVED";

  let approvedAmount = 0;

  if (nextStatus === "APPROVED") {
    const value = window.prompt(
      "Informe o valor aprovado:",
      String(group.expectedAmount),
    );

    if (value === null) {
      return;
    }

    approvedAmount = Number(
      value.replace(",", "."),
    );

    if (
      !Number.isFinite(approvedAmount) ||
      approvedAmount < 0
    ) {
      setActionError("Informe um valor aprovado válido.");
      return;
    }
  }

  setActionError(null);
  setProcessingGroupId(group.groupId);

  try {
    const response = await fetch(
      `/api/admin/inscricoes/${encodeURIComponent(
        group.groupId,
      )}/pix`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          approvedAmount,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ?? "Não foi possível atualizar o PIX.",
      );
    }

    setGroups((currentGroups) =>
      currentGroups.map((currentGroup) =>
        currentGroup.groupId === group.groupId
          ? result.group
          : currentGroup,
      ),
    );
  } catch (error) {
    setActionError(
      error instanceof Error
        ? error.message
        : "Não foi possível atualizar o PIX.",
    );
  } finally {
    setProcessingGroupId(null);
  }
}

async function deleteRegistration(
  group: AdminGroupRecord,
) {
  const confirmed = window.confirm(
    `Deseja excluir a inscrição ${group.groupId}?`,
  );

  if (!confirmed) {
    return;
  }

  setActionError(null);
  setProcessingGroupId(group.groupId);

  try {
    const response = await fetch(
      `/api/admin/inscricoes/${encodeURIComponent(
        group.groupId,
      )}`,
      {
        method: "DELETE",
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ?? "Não foi possível excluir a inscrição.",
      );
    }

    setGroups((currentGroups) =>
      currentGroups.filter(
        (currentGroup) =>
          currentGroup.groupId !== group.groupId,
      ),
    );
  } catch (error) {
    setActionError(
      error instanceof Error
        ? error.message
        : "Não foi possível excluir a inscrição.",
    );
  } finally {
    setProcessingGroupId(null);
  }
}
  if (loading) {
    return (
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-white/60">
        Carregando inscrições...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-3xl border border-red-300/20 bg-red-400/10 p-6 text-red-100">
        {error}
      </div>
    );
  }

  return (
    <section className="mt-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-semibold text-white/80">
              Buscar inscrição
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />

              <TextInput
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="ID, e-mail ou nome do Pai adotivo"
                className="pl-12"
              />
            </div>
          </div>

          <div className="w-full lg:w-64">
            <label className="mb-2 block text-sm font-semibold text-white/80">
              Status do PIX
            </label>

            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />

              <select
                value={pixStatus}
                onChange={(event) =>
                  setPixStatus(event.target.value)
                }
                className="min-h-12 w-full rounded-xl border border-white/15 bg-white/10 pl-12 pr-4 text-white outline-none focus:border-pink-300"
              >
                <option value="ALL">Todos</option>
                <option value="PENDING_REVIEW">Pendente</option>
                <option value="APPROVED">Aprovado</option>
                <option value="REJECTED">Rejeitado</option>
              </select>
            </div>
          </div>
        </div>
      </div>
                {actionError && (
                <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
                    {actionError}
                </div>
                )}
      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-[1350px] w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-white/45">
              <tr>
                <th className="px-5 py-4">Inscrição</th>
                <th className="px-5 py-4">Pai adotivo</th>
                <th className="px-5 py-4">Convidados</th>
                <th className="px-5 py-4">Valor previsto</th>
                <th className="px-5 py-4">PIX</th>
                <th className="px-5 py-4">Criada em</th>
                <th className="px-5 py-4">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {filteredGroups.map((group) => (
                <tr
                  key={group.groupId}
                  className="transition hover:bg-white/5"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-white">
                        {group.email}
                    </p>

                    <p className="mt-1 text-xs text-white/45">
                        {group.groupId}
                    </p>
                    </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">
                      {group.sponsorName}
                    </p>

                    <p className="mt-1 text-xs text-white/45">
                      {group.sponsorWhatsapp}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-white/75">
                    {group.guestCount}
                  </td>

                  <td className="px-5 py-4 font-semibold text-white">
                    {formatCurrency(group.expectedAmount)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPixStatusClass(
                        group.pixStatus,
                      )}`}
                    >
                      {getPixStatusLabel(group.pixStatus)}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-white/60">
                    {formatDate(group.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {group.receiptUrl && (
                        <a
                            href={group.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl border border-white/10 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                            title="Abrir comprovante"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                        )}

                        <button
                        type="button"
                        onClick={() => changePixStatus(group)}
                        disabled={processingGroupId === group.groupId}
                        className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                        {processingGroupId === group.groupId
                            ? "Salvando..."
                            : group.pixStatus === "APPROVED"
                            ? "Desaprovar PIX"
                            : "Aprovar PIX"}
                        </button>

                        <button
                        type="button"
                        onClick={() => deleteRegistration(group)}
                        disabled={processingGroupId === group.groupId}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                        </button>

                        <Link
                        href={`/admin/inscricoes/${encodeURIComponent(
                          group.groupId,
                        )}`}
                        className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                      >
                        Detalhes
                      </Link>
                    </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGroups.length === 0 && (
          <div className="p-10 text-center text-white/50">
            Nenhuma inscrição encontrada.
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-white/40">
        Exibindo {filteredGroups.length} de {groups.length} inscrições.
      </p>
    </section>
  );
}