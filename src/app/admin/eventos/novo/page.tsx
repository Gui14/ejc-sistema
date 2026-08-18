"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";

const initialForm = {
  name: "",
  edition: "",
  startDate: "",
  endDate: "",
  location: "",
  description: "",
  status: "PLANNED",
};

export default function NovoEventoPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/eventos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Não foi possível criar o evento.");
      }

      router.push(`/admin/eventos/${data.evento.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível criar o evento."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Botão Voltar */}
      <Link
        href="/admin/eventos"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para eventos
      </Link>

      {/* Cabeçalho */}
      <header className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
          Eventos
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
          Novo evento
        </h1>
        <p className="mt-2.5 text-slate-400">
          Cadastre o evento que será usado para organizar equipes, participantes
          e movimentações financeiras.
        </p>
      </header>

      {/* Container do Formulário (Glassmorphism) */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-xl backdrop-blur-md sm:p-8"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Nome do Evento */}
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Nome do evento
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Ex.: EJC 2026"
              className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Edição */}
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Edição
            </label>
            <input
              required
              value={form.edition}
              onChange={(e) => updateField("edition", e.target.value)}
              placeholder="Ex.: 23º EJC"
              className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Data Inicial */}
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Data inicial
            </label>
            <input
              required
              type="date"
              value={form.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
            />
          </div>

          {/* Data Final */}
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Data final
            </label>
            <input
              required
              type="date"
              value={form.endDate}
              onChange={(e) => updateField("endDate", e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
            />
          </div>

          {/* Local (Ocupa 2 colunas) */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300">
              Local
            </label>
            <input
              required
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="Ex.: Casa de Encontro"
              className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Status (Ocupa 2 colunas) */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300">
              Status
            </label>
            <div className="relative mt-1.5">
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="block w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="PLANNED">Planejado</option>
                <option value="IN_PROGRESS">Em andamento</option>
                <option value="FINISHED">Finalizado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
              {/* Seta customizada para o Select */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Descrição (Ocupa 2 colunas) */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Informações adicionais sobre o evento"
              rows={5}
              className="mt-1.5 block w-full resize-y rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Alerta de Erro */}
        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <p>{error}</p>
          </div>
        )}

        {/* Ações do Formulário */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-800/60 pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/admin/eventos"
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Salvando..." : "Criar evento"}
          </button>
        </div>
      </form>
    </div>
  );
}