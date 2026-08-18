"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Wallet,
} from "lucide-react";

type Evento = { id: string; name: string; edition: string };
type Movement = {
  id: string;
  type: "ENTRADA" | "SAIDA" | string;
  description: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  responsible: string;
  status: string;
};
type Summary = {
  receitas: number;
  despesas: number;
  saldo: number;
  pendentes: number;
};

const initialForm = {
  type: "ENTRADA",
  description: "",
  category: "",
  amount: "",
  date: "",
  paymentMethod: "",
  responsible: "",
  status: "PENDENTE",
  notes: "",
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function date(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export default function FinanceiroEventoPage() {
  const params = useParams<{ eventoId: string }>();
  const eventoId = params.eventoId;

  const [evento, setEvento] = useState<Evento | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<Movement[]>([]);
  const [resumo, setResumo] = useState<Summary>({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    pendentes: 0,
  });
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("TODAS");

  async function loadFinanceiro() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/eventos/${eventoId}/financeiro`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok || !data.ok)
        throw new Error(data.error ?? "Não foi possível carregar o financeiro.");
      setEvento(data.evento);
      setMovimentacoes(data.movimentacoes ?? []);
      setResumo(
        data.resumo ?? { receitas: 0, despesas: 0, saldo: 0, pendentes: 0 }
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível carregar o financeiro."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (eventoId) void loadFinanceiro();
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
      const response = await fetch(`/api/admin/eventos/${eventoId}/financeiro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: form.amount.replace(",", "."),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok)
        throw new Error(data.error ?? "Não foi possível cadastrar a movimentação.");

      setForm(initialForm);
      setMessage("Movimentação cadastrada com sucesso.");
      await loadFinanceiro();
      
      // Limpa mensagem de sucesso após 3 segundos
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível cadastrar a movimentação."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Carregando financeiro...</p>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pt-12">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-200">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-rose-400" />
          <p className="text-lg font-medium">
            {error || "Evento não encontrado."}
          </p>
        </div>
      </div>
    );
  }

  const filteredMovimentacoes = movimentacoes.filter((movement) => {
    if (filter === "ENTRADAS") return movement.type === "ENTRADA";
    if (filter === "SAIDAS") return movement.type === "SAIDA";
    if (filter === "PENDENTES") return movement.status === "PENDENTE";
    if (filter === "CONFIRMADAS") return movement.status === "CONFIRMADO";
    if (filter === "CANCELADAS") return movement.status === "CANCELADO";
    return true;
  });

  const filterOptions = [
    { label: "Todas", value: "TODAS" },
    { label: "Receitas", value: "ENTRADAS" },
    { label: "Despesas", value: "SAIDAS" },
    { label: "Pendentes", value: "PENDENTES" },
    { label: "Confirmadas", value: "CONFIRMADAS" },
    { label: "Canceladas", value: "CANCELADAS" },
  ];

  const saldoColor =
    resumo.saldo > 0
      ? "text-emerald-400"
      : resumo.saldo < 0
      ? "text-rose-400"
      : "text-slate-200";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Voltar */}
      <Link
        href={`/admin/eventos/${evento.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o evento
      </Link>

      {/* Header Financeiro */}
      <header className="flex flex-col gap-4 border-b border-slate-800/60 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indigo-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Financeiro do Evento
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
            {evento.name}
          </h1>
          <p className="mt-1 text-lg text-slate-400">{evento.edition}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadFinanceiro}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
          <a
            href={`/api/admin/eventos/${evento.id}/financeiro/export`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-600"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </a>
        </div>
      </header>

      {/* Grid de Resumo (Cards) */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Receitas */}
        <div className="flex flex-col justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 shadow-sm backdrop-blur-sm">
          <span className="flex items-center gap-2 text-sm font-medium text-emerald-400/80">
            <TrendingUp className="h-4 w-4" />
            Receitas confirmadas
          </span>
          <strong className="mt-2 text-2xl font-bold text-emerald-400">
            {money(resumo.receitas)}
          </strong>
        </div>

        {/* Despesas */}
        <div className="flex flex-col justify-between rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 shadow-sm backdrop-blur-sm">
          <span className="flex items-center gap-2 text-sm font-medium text-rose-400/80">
            <TrendingDown className="h-4 w-4" />
            Despesas confirmadas
          </span>
          <strong className="mt-2 text-2xl font-bold text-rose-400">
            {money(resumo.despesas)}
          </strong>
        </div>

        {/* Saldo */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm backdrop-blur-sm">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <DollarSign className="h-4 w-4" />
            Saldo em Caixa
          </span>
          <strong className={`mt-2 text-2xl font-bold ${saldoColor}`}>
            {money(resumo.saldo)}
          </strong>
        </div>

        {/* Pendências */}
        <div className="flex flex-col justify-between rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 shadow-sm backdrop-blur-sm">
          <span className="flex items-center gap-2 text-sm font-medium text-amber-400/80">
            <Clock className="h-4 w-4" />
            Movimentações Pendentes
          </span>
          <strong className="mt-2 text-2xl font-bold text-amber-400">
            {resumo.pendentes}
          </strong>
        </div>
      </section>

      {/* Grid Principal: Formulário à esq, Lista à dir */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* COLUNA ESQUERDA: Formulário */}
        <aside className="lg:col-span-5 lg:sticky lg:top-8">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-xl backdrop-blur-md sm:p-8"
          >
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-100">
              <Plus className="h-5 w-5 text-indigo-400" />
              Nova Movimentação
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-slate-300">
                  Tipo
                </label>
                <div className="relative mt-1.5">
                  <select
                    value={form.type}
                    onChange={(e) => updateField("type", e.target.value)}
                    className="block w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="ENTRADA">Receita (+)</option>
                    <option value="SAIDA">Despesa (-)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-slate-300">
                  Status
                </label>
                <div className="relative mt-1.5">
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                    className="block w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="CONFIRMADO">Confirmado</option>
                    <option value="CANCELADO">Cancelado</option>
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
                <input
                  required
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Ex.: Inscrições de membros"
                  className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-slate-300">
                  Categoria
                </label>
                <input
                  required
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  placeholder="Ex.: Alimentação"
                  className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-slate-300">
                  Valor
                </label>
                <input
                  required
                  min="0.01"
                  step="0.01"
                  type="number"
                  value={form.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  placeholder="0,00"
                  className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-slate-300">
                  Data
                </label>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-slate-300">
                  Forma de pagamento
                </label>
                <input
                  value={form.paymentMethod}
                  onChange={(e) => updateField("paymentMethod", e.target.value)}
                  placeholder="Ex.: PIX"
                  className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300">
                  Responsável
                </label>
                <input
                  value={form.responsible}
                  onChange={(e) => updateField("responsible", e.target.value)}
                  placeholder="Ex.: João da Silva"
                  className="mt-1.5 block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300">
                  Observações
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  className="mt-1.5 block w-full resize-y rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-200 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {error && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
                <p>{error}</p>
              </div>
            )}
            {message && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <p>{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {saving ? "Salvando..." : "Cadastrar Movimentação"}
            </button>
          </form>
        </aside>

        {/* COLUNA DIREITA: Lista de Movimentações */}
        <section className="lg:col-span-7 flex flex-col h-full rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden backdrop-blur-sm">
          {/* Header da Lista & Filtros */}
          <div className="border-b border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100">
                Histórico
              </h2>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                {filteredMovimentacoes.length}{" "}
                {filteredMovimentacoes.length === 1 ? "registro" : "registros"}
              </span>
            </div>

            {/* Filtros Horizontais */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    filter === opt.value
                      ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Container de Rolagem da Lista */}
          <div className="flex-1 overflow-y-auto max-h-[700px] p-5">
            {filteredMovimentacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <Wallet className="mb-4 h-12 w-12 opacity-20" />
                <p>Nenhuma movimentação encontrada para este filtro.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredMovimentacoes.map((movement) => {
                  const isEntrada = movement.type === "ENTRADA";

                  // Estilo do Status Badge na lista
                  let badgeClass = "bg-slate-500/10 text-slate-400 border-slate-500/20";
                  if (movement.status === "PENDENTE")
                    badgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  if (movement.status === "CONFIRMADO")
                    badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  if (movement.status === "CANCELADO")
                    badgeClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";

                  return (
                    <article
                      key={movement.id}
                      className="group flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800/60 bg-slate-900/50 p-4 transition hover:bg-slate-800/40"
                    >
                      <div className="flex flex-col gap-1">
                        <strong className="text-slate-200">
                          {movement.description}
                        </strong>
                        <span className="text-sm text-slate-400">
                          {movement.category} • {date(movement.date)}
                        </span>
                      </div>

                      <div className="flex items-end sm:items-center sm:flex-col gap-2 sm:gap-1 text-right">
                        <strong
                          className={`text-lg ${
                            isEntrada ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isEntrada ? "+" : "-"}
                          {money(movement.amount)}
                        </strong>
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                        >
                          {movement.status}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}