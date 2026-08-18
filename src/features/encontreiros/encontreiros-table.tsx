"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Check,
  X,
  Pencil,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  Filter,
} from "lucide-react";

import type {
  Encontreiro,
  PixStatus,
} from "@/features/encontreiros/encontreiros-repository";

type StatusFilterOption = "ALL" | PixStatus;

type Props = {
  encontreiros: Encontreiro[];
};

export function EncontreirosTable({ encontreiros: initialEncontreiros }: Props) {
  const router = useRouter();
  const [encontreiros, setEncontreiros] = useState<Encontreiro[]>(initialEncontreiros);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Contadores globais de estatísticas
  const stats = useMemo(() => {
    const approved = encontreiros.filter((e) => e.pixStatus === "APPROVED").length;
    const rejected = encontreiros.filter((e) => e.pixStatus === "REJECTED").length;
    const pending = encontreiros.filter((e) => e.pixStatus === "PENDING").length;

    return { approved, rejected, pending, total: encontreiros.length };
  }, [encontreiros]);

  // Filtro combinado de busca por texto + status
  const filteredEncontreiros = useMemo(() => {
    return encontreiros.filter((item) => {
      // 1. Filtro por Status
      if (statusFilter !== "ALL" && item.pixStatus !== statusFilter) {
        return false;
      }

      // 2. Filtro por Busca de Texto
      const q = query.trim().toLowerCase();
      if (!q) return true;

      const church = item.church === "OTHER" ? item.otherChurch : item.church;
      const city = item.city === "OTHER" ? item.otherCity : item.city;

      const text = [
        item.name,
        item.email,
        item.whatsapp,
        church,
        city,
        item.adminObservation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [query, statusFilter, encontreiros]);

  async function handlePixStatus(
    id: string,
    pixStatus: Exclude<PixStatus, "PENDING">
  ) {
    const adminObservation =
      pixStatus === "REJECTED"
        ? window.prompt("Informe o motivo da rejeição do PIX:", "") ?? ""
        : window.prompt("Observação do administrador, se necessário:", "") ?? "";

    if (pixStatus === "REJECTED" && !adminObservation.trim()) {
      window.alert("Informe o motivo da rejeição.");
      return;
    }

    setLoadingId(id);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/encontreiros/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pixStatus,
            adminObservation: adminObservation.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Não foi possível atualizar o PIX."
        );
      }

      // Atualiza o estado local reativamente
      setEncontreiros((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                pixStatus: pixStatus as Encontreiro["pixStatus"],
                adminObservation: adminObservation.trim(),
              }
            : item
        )
      );

      router.refresh();
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível atualizar o PIX.";

      setError(message);
    } finally {
      setLoadingId(null);
    }
  }

  function renderPixBadge(status: PixStatus | string) {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Aprovado
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-400">
            <XCircle className="h-3 w-3" />
            Rejeitado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
            <Clock className="h-3 w-3" />
            Pendente
          </span>
        );
    }
  }

  return (
    <div className="space-y-6">
      {/* Barra de Busca e Filtros de Status */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 shadow-sm backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, e-mail, telefone, igreja ou cidade..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Botões de Filtro de Status / Métricas */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition ${
              statusFilter === "ALL"
                ? "border-indigo-500 bg-indigo-500/20 text-indigo-200 shadow-sm"
                : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <Filter className="h-3 w-3" />
            <span>Todos:</span>
            <strong className="text-slate-100">{stats.total}</strong>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("APPROVED")}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition ${
              statusFilter === "APPROVED"
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-200 shadow-sm"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>Aprovados:</span>
            <strong>{stats.approved}</strong>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("PENDING")}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition ${
              statusFilter === "PENDING"
                ? "border-amber-500 bg-amber-500/20 text-amber-200 shadow-sm"
                : "border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
            }`}
          >
            <Clock className="h-3 w-3" />
            <span>Pendentes:</span>
            <strong>{stats.pending}</strong>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("REJECTED")}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition ${
              statusFilter === "REJECTED"
                ? "border-rose-500 bg-rose-500/20 text-rose-200 shadow-sm"
                : "border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
            }`}
          >
            <XCircle className="h-3 w-3" />
            <span>Rejeitados:</span>
            <strong>{stats.rejected}</strong>
          </button>
        </div>
      </div>

      {/* Alerta de Erro */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-rose-400 hover:underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Tabela de Dados */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Nome & Contato</th>
                <th className="px-6 py-4">Igreja & Cidade</th>
                <th className="px-6 py-4">Status PIX</th>
                <th className="px-6 py-4">Comprovante</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {filteredEncontreiros.map((encontreiro) => {
                const isLoading = loadingId === encontreiro.id;
                const church =
                  encontreiro.church === "OTHER"
                    ? encontreiro.otherChurch
                    : encontreiro.church;
                const city =
                  encontreiro.city === "OTHER"
                    ? encontreiro.otherCity
                    : encontreiro.city;

                return (
                  <tr
                    key={encontreiro.id}
                    className="transition-colors hover:bg-slate-800/40"
                  >
                    {/* Nome e E-mail */}
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-2.5">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-100">
                            {encontreiro.name}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-slate-400">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span>{encontreiro.email}</span>
                          </p>
                          {encontreiro.whatsapp && (
                            <p className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                              <Phone className="h-3 w-3 shrink-0" />
                              <span>{encontreiro.whatsapp}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Igreja e Cidade */}
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-1 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{church || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span>{city || "—"}</span>
                        </div>
                      </div>
                    </td>

                    {/* PIX Status & Observação */}
                    <td className="px-6 py-4 align-top">
                      <div>
                        {renderPixBadge(encontreiro.pixStatus)}

                        {encontreiro.adminObservation && (
                          <p className="mt-2 max-w-xs text-xs text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                            <strong className="text-slate-300">Obs:</strong>{" "}
                            {encontreiro.adminObservation}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Comprovante */}
                    <td className="px-6 py-4 align-top">
                      {encontreiro.pixReceiptUrl ? (
                        <a
                          href={encontreiro.pixReceiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Abrir PIX</span>
                          <ExternalLink className="h-3 w-3 opacity-70" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500 italic">
                          Não enviado
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() =>
                            handlePixStatus(encontreiro.id, "APPROVED")
                          }
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Aprovar PIX"
                        >
                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          <span className="hidden sm:inline">Aprovar</span>
                        </button>

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() =>
                            handlePixStatus(encontreiro.id, "REJECTED")
                          }
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Rejeitar PIX"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Rejeitar</span>
                        </button>

                        <Link
                          href={`/admin/encontreiros/${encodeURIComponent(
                            encontreiro.id
                          )}`}
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
                          title="Editar Encontreiro"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Editar</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredEncontreiros.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-slate-400">
                      Nenhum encontreiro encontrado para os filtros selecionados.
                    </p>
                    {(query || statusFilter !== "ALL") && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setStatusFilter("ALL");
                        }}
                        className="mt-2 text-xs font-medium text-indigo-400 hover:underline"
                      >
                        Limpar filtros
                      </button>
                    )}
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