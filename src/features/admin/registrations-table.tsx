"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Trash2,
  Eye,
  Users,
  Loader2,
  AlertCircle,
  Receipt,
  Mail,
  User,
} from "lucide-react";

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
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderPixBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Aprovado
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400">
          <XCircle className="h-3.5 w-3.5" />
          Rejeitado
        </span>
      );
    case "PENDING_REVIEW":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
          <Clock className="h-3.5 w-3.5" />
          Pendente
        </span>
      );
  }
}

export function RegistrationsTable() {
  const [groups, setGroups] = useState<AdminGroupRecord[]>([]);
  const [search, setSearch] = useState("");
  const [pixStatus, setPixStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingGroupId, setProcessingGroupId] = useState<string | null>(null);

  useEffect(() => {
    async function loadGroups() {
      try {
        const response = await fetch("/api/admin/inscricoes");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ?? "Não foi possível carregar as inscrições."
          );
        }

        setGroups(result.groups);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar as inscrições."
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
        pixStatus === "ALL" || group.pixStatus === pixStatus;

      return matchesSearch && matchesPix;
    });
  }, [groups, pixStatus, search]);

  async function changePixStatus(group: AdminGroupRecord) {
    const nextStatus =
      group.pixStatus === "APPROVED" ? "PENDING_REVIEW" : "APPROVED";

    let approvedAmount = 0;

    if (nextStatus === "APPROVED") {
      const value = window.prompt(
        "Informe o valor aprovado:",
        String(group.expectedAmount)
      );

      if (value === null) {
        return;
      }

      approvedAmount = Number(value.replace(",", "."));

      if (!Number.isFinite(approvedAmount) || approvedAmount < 0) {
        setActionError("Informe um valor aprovado válido.");
        return;
      }
    }

    setActionError(null);
    setProcessingGroupId(group.groupId);

    try {
      const response = await fetch(
        `/api/admin/inscricoes/${encodeURIComponent(group.groupId)}/pix`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
            approvedAmount,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Não foi possível atualizar o PIX."
        );
      }

      setGroups((currentGroups) =>
        currentGroups.map((currentGroup) =>
          currentGroup.groupId === group.groupId ? result.group : currentGroup
        )
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o PIX."
      );
    } finally {
      setProcessingGroupId(null);
    }
  }

  async function deleteRegistration(group: AdminGroupRecord) {
    const confirmed = window.confirm(
      `Deseja excluir a inscrição ${group.groupId}?`
    );

    if (!confirmed) {
      return;
    }

    setActionError(null);
    setProcessingGroupId(group.groupId);

    try {
      const response = await fetch(
        `/api/admin/inscricoes/${encodeURIComponent(group.groupId)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Não foi possível excluir a inscrição."
        );
      }

      setGroups((currentGroups) =>
        currentGroups.filter(
          (currentGroup) => currentGroup.groupId !== group.groupId
        )
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir a inscrição."
      );
    } finally {
      setProcessingGroupId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-8 backdrop-blur-md">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-slate-400">Carregando inscrições...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-200 backdrop-blur-md">
        <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  const approvedCount = filteredGroups.filter((g) => g.pixStatus === "APPROVED").length;

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center">
        
        {/* Input de Busca */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ID, e-mail ou Pai Adotivo..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Select de Status do PIX */}
        <div className="relative w-full sm:w-56 shrink-0">
          <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={pixStatus}
            onChange={(e) => setPixStatus(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-10 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          >
            <option value="ALL">Todos os status PIX</option>
            <option value="PENDING_REVIEW">Pendente</option>
            <option value="APPROVED">Aprovado</option>
            <option value="REJECTED">Rejeitado</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Alerta de Erro de Ação */}
      {actionError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-xs text-rose-400 hover:underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Resumo de Resultados */}
      <div className="flex items-center justify-between px-1 text-sm font-medium">
        <span className="text-slate-400">
          Exibindo <span className="text-white">{filteredGroups.length}</span> de{" "}
          <span className="text-white">{groups.length}</span> inscrições
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" />
          {approvedCount} PIX aprovados
        </span>
      </div>

      {/* Container da Tabela */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Inscrição</th>
                <th className="px-6 py-4">Pai Adotivo</th>
                <th className="px-6 py-4">Convidados</th>
                <th className="px-6 py-4">Valor Previsto</th>
                <th className="px-6 py-4">Status PIX</th>
                <th className="px-6 py-4">Criada em</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {filteredGroups.map((group) => {
                const isProcessing = processingGroupId === group.groupId;

                return (
                  <tr key={group.groupId} className="transition-colors hover:bg-slate-800/40">
                    {/* Coluna Inscrição */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-100">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[220px]" title={group.email}>
                            {group.email}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-slate-500">
                          ID: {group.groupId}
                        </div>
                      </div>
                    </td>

                    {/* Coluna Pai Adotivo */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-medium text-slate-200">
                          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {group.sponsorName}
                        </div>
                        <div className="font-mono text-xs text-slate-400">
                          {group.sponsorWhatsapp || "—"}
                        </div>
                      </div>
                    </td>

                    {/* Coluna Convidados */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-200">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {group.guestCount}
                      </span>
                    </td>

                    {/* Coluna Valor Previsto */}
                    <td className="px-6 py-4 font-semibold text-slate-100">
                      {formatCurrency(group.expectedAmount)}
                    </td>

                    {/* Coluna PIX */}
                    <td className="px-6 py-4">
                      {renderPixBadge(group.pixStatus)}
                    </td>

                    {/* Coluna Criada em */}
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(group.createdAt)}
                    </td>

                    {/* Coluna Ações */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Ver Comprovante */}
                        {group.receiptUrl && (
                          <a
                            href={group.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                            title="Abrir Comprovante"
                          >
                            <Receipt className="h-4 w-4" />
                          </a>
                        )}

                        {/* Alterar Status PIX */}
                        <button
                          type="button"
                          onClick={() => changePixStatus(group)}
                          disabled={isProcessing}
                          className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            group.pixStatus === "APPROVED"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                          }`}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          <span>
                            {isProcessing
                              ? "Salvando..."
                              : group.pixStatus === "APPROVED"
                              ? "Desaprovar"
                              : "Aprovar PIX"}
                          </span>
                        </button>

                        {/* Excluir Inscrição */}
                        <button
                          type="button"
                          onClick={() => deleteRegistration(group)}
                          disabled={isProcessing}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Excluir Inscrição"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>

                        {/* Ver Detalhes */}
                        <Link
                          href={`/admin/inscricoes/${encodeURIComponent(group.groupId)}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Empty State */}
              {filteredGroups.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center justify-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50">
                        <Search className="h-6 w-6 text-slate-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-300">Nenhuma inscrição encontrada.</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Tente ajustar os termos de busca ou o filtro de status PIX.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}