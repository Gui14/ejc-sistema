"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Edit2,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Wallet
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

const statusConfig: Record<string, { label: string; classes: string }> = {
  PLANNED: {
    label: "Planejado",
    classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  IN_PROGRESS: {
    label: "Em andamento",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  FINISHED: {
    label: "Finalizado",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  CANCELLED: {
    label: "Cancelado",
    classes: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
};

const initialForm = {
  name: "",
  edition: "",
  startDate: "",
  endDate: "",
  location: "",
  description: "",
  status: "PLANNED",
};

function formatDate(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export default function EventoPage() {
  const params = useParams<{ eventoId: string }>();
  const router = useRouter();
  const eventoId = params.eventoId;

  const [evento, setEvento] = useState<Evento | null>(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadEvento() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/eventos/${eventoId}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Não foi possível carregar o evento.");
      }

      setEvento(data.evento);
      setForm({
        name: data.evento.name,
        edition: data.evento.edition,
        startDate: data.evento.startDate,
        endDate: data.evento.endDate,
        location: data.evento.location,
        description: data.evento.description,
        status: data.evento.status,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o evento."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (eventoId) void loadEvento();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventoId]);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/eventos/${eventoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Não foi possível atualizar o evento.");
      }

      setEvento(data.evento);
      setEditing(false);
      setMessage("Evento atualizado com sucesso.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o evento."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Deseja realmente excluir este evento? Esta ação não pode ser desfeita.")) return;

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/eventos/${eventoId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Não foi possível excluir o evento.");
      }

      router.push("/admin/eventos");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o evento."
      );
      setDeleting(false);
    }
  }

  // ESTADO: CARREGANDO
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Carregando evento...</p>
        </div>
      </div>
    );
  }

  // ESTADO: ERRO (Sem evento)
  if (error && !evento) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pt-12">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-200">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-rose-400" />
          <p className="text-lg font-medium">{error}</p>
        </div>
        <div className="flex justify-center">
          <Link
            href="/admin/eventos"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para eventos
          </Link>
        </div>
      </div>
    );
  }

  if (!evento) return null;

  const currentStatus = statusConfig[evento.status] || {
    label: evento.status,
    classes: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Voltar */}
      <Link
        href="/admin/eventos"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para eventos
      </Link>

      {/* Header do Evento */}
      <header className="flex flex-col gap-4 border-b border-slate-800/60 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
            Detalhes do Evento
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
            {evento.name}
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            {evento.edition} · {evento.location}
          </p>
        </div>
        <div className="flex sm:justify-end">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${currentStatus.classes}`}
          >
            {currentStatus.label}
          </span>
        </div>
      </header>

      {/* Alertas de Sucesso/Erro */}
      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <p>{message}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <p>{error}</p>
        </div>
      )}

      {/* Grid de Informações Rápidas */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm backdrop-blur-sm">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <Calendar className="h-4 w-4 text-indigo-400" />
            Período
          </span>
          <strong className="text-slate-200">
            {formatDate(evento.startDate)} — {formatDate(evento.endDate)}
          </strong>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm backdrop-blur-sm">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <MapPin className="h-4 w-4 text-indigo-400" />
            Local
          </span>
          <strong className="text-slate-200">{evento.location}</strong>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm backdrop-blur-sm">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <DollarSign className="h-4 w-4 text-indigo-400" />
            Financeiro
          </span>
          <strong className="text-slate-200">Integrado ao evento</strong>
        </div>
      </section>

      {/* Banner Financeiro */}
      <section className="relative flex flex-col items-start gap-6 overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="relative z-10">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-400">
            Módulo Financeiro
          </p>
          <h2 className="text-xl font-bold text-slate-100">
            Gerenciar Receitas e Despesas
          </h2>
          <p className="mt-1 text-sm text-indigo-200/70">
            Acompanhe toda a movimentação financeira vinculada a este evento.
          </p>
        </div>
        <Link
          href={`/admin/eventos/${evento.id}/financeiro`}
          className="relative z-10 inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-600"
        >
          <Wallet className="h-4 w-4" />
          Abrir financeiro
        </Link>
        {/* Efeito visual de fundo do banner */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
      </section>

      {/* Ações (Editar / Excluir) */}
      <section className="flex flex-wrap gap-3">
        <button
          onClick={() => setEditing((v) => !v)}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
            editing
              ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
              : "border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {editing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          {editing ? "Fechar edição" : "Editar evento"}
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {deleting ? "Excluindo..." : "Excluir evento"}
        </button>
      </section>

      {/* Formulário de Edição */}
      {editing && (
        <form
          onSubmit={handleSubmit}
          className="animate-in fade-in slide-in-from-top-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-xl backdrop-blur-md sm:p-8"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Nome do evento
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Edição
              </label>
              <input
                required
                value={form.edition}
                onChange={(e) => updateField("edition", e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Data inicial
              </label>
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Data final
              </label>
              <input
                required
                type="date"
                value={form.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300">
                Local
              </label>
              <input
                required
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300">
                Status
              </label>
              <div className="relative mt-1.5">
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="PLANNED">Planejado</option>
                  <option value="IN_PROGRESS">Em andamento</option>
                  <option value="FINISHED">Finalizado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300">
                Descrição
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                className="mt-1.5 block w-full resize-y rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-slate-800/60 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      )}

      {/* Descrição em Texto Pleno */}
      {!editing && evento.description && (
        <section className="rounded-2xl border border-slate-800/50 bg-slate-900/20 p-6 sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-200">
            Sobre o Evento
          </h2>
          <p className="whitespace-pre-wrap leading-relaxed text-slate-400">
            {evento.description}
          </p>
        </section>
      )}
    </div>
  );
}