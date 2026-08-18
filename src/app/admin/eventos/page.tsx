"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  RefreshCcw,
  MapPin,
  Calendar,
  ArrowRight,
  DollarSign,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
} from "lucide-react";

type Evento = {
  id: string;
  name: string;
  edition: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  status: string;
};

const statusLabels: Record<string, string> = {
  PLANNED: "Planejado",
  IN_PROGRESS: "Em andamento",
  FINISHED: "Finalizado",
  CANCELLED: "Cancelado",
};

function formatDate(value: string) {
  if (!value) return "—";

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

// Renderizador de Status estilo Glassmorphism
function renderStatusBadge(status: string) {
  const baseClasses =
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium";

  switch (status) {
    case "PLANNED":
      return (
        <span className={`${baseClasses} border-indigo-500/20 bg-indigo-500/10 text-indigo-400`}>
          <Clock className="h-3 w-3" />
          {statusLabels[status]}
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className={`${baseClasses} border-amber-500/20 bg-amber-500/10 text-amber-400`}>
          <PlayCircle className="h-3 w-3" />
          {statusLabels[status]}
        </span>
      );
    case "FINISHED":
      return (
        <span className={`${baseClasses} border-emerald-500/20 bg-emerald-500/10 text-emerald-400`}>
          <CheckCircle2 className="h-3 w-3" />
          {statusLabels[status]}
        </span>
      );
    case "CANCELLED":
      return (
        <span className={`${baseClasses} border-rose-500/20 bg-rose-500/10 text-rose-400`}>
          <XCircle className="h-3 w-3" />
          {statusLabels[status]}
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} border-slate-500/20 bg-slate-500/10 text-slate-400`}>
          {statusLabels[status] ?? status}
        </span>
      );
  }
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEventos() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/eventos", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Não foi possível carregar os eventos.");
      }

      setEventos(data.eventos ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os eventos."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEventos();
  }, []);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
            Administração
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
            Eventos
          </h1>
          <p className="mt-2.5 max-w-[650px] text-slate-400">
            Cadastre e acompanhe os eventos e seus respectivos financeiros.
          </p>
        </div>

        <Link
          href="/admin/eventos/novo"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-600 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Novo evento
        </Link>
      </header>

      {/* Barra de Ferramentas (Toolbar) */}
      <section
        className="flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
        aria-label="Ações de eventos"
      >
        <span className="text-sm font-medium text-slate-400">
          {eventos.length} evento(s) cadastrado(s)
        </span>
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white sm:w-auto"
          onClick={loadEventos}
          type="button"
        >
          <RefreshCcw className="h-4 w-4" />
          Atualizar
        </button>
      </section>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 py-12 text-slate-400 justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
          <p className="text-sm font-medium">Carregando eventos...</p>
        </div>
      )}

      {/* Erro */}
      {!loading && error && (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center backdrop-blur-md"
          role="alert"
        >
          <AlertCircle className="mb-3 h-10 w-10 text-rose-400" />
          <p className="mb-6 max-w-md text-rose-200">{error}</p>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/20 px-5 py-2.5 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/30"
            onClick={loadEventos}
            type="button"
          >
            <RefreshCcw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Estado Vazio */}
      {!loading && !error && eventos.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/50 p-12 text-center shadow-xl backdrop-blur-md">
          <h2 className="text-xl font-bold text-slate-200">
            Nenhum evento cadastrado
          </h2>
          <p className="mb-6 mt-2 text-sm text-slate-400">
            Comece cadastrando o primeiro evento para gerenciar inscrições e pagamentos.
          </p>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-600"
            href="/admin/eventos/novo"
          >
            <Plus className="h-4 w-4" />
            Cadastrar evento
          </Link>
        </div>
      )}

      {/* Lista de Eventos (Grid) */}
      {!loading && !error && eventos.length > 0 && (
        <section
          className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5"
          aria-label="Lista de eventos"
        >
          {eventos.map((evento) => (
            <article
              className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-xl backdrop-blur-md transition-colors hover:border-slate-700/80"
              key={evento.id}
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between gap-3">
                {renderStatusBadge(evento.status)}
                <span className="rounded-md bg-slate-950/50 px-2 py-1 text-xs font-semibold text-slate-400 border border-slate-800">
                  {evento.edition}
                </span>
              </div>

              {/* Título */}
              <h2 className="mb-4 mt-5 text-xl font-bold leading-tight text-slate-100">
                {evento.name}
              </h2>
              
              {/* Infos (Local / Data) */}
              <div className="mb-6 mt-auto space-y-2.5">
                <p className="flex items-center gap-2.5 text-sm text-slate-300">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate">{evento.location}</span>
                </p>
                <p className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
                  <span>
                    {formatDate(evento.startDate)} — {formatDate(evento.endDate)}
                  </span>
                </p>
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-2 border-t border-slate-800/60 pt-4">
                <Link
                  href={`/admin/eventos/${evento.id}`}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  Abrir evento
                </Link>
                <Link
                  href={`/admin/eventos/${evento.id}/financeiro`}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  Financeiro
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}