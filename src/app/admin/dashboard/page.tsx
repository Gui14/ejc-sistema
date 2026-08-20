"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CircleDollarSign,
  ExternalLink,
  HeartHandshake,
  Loader2,
  Plus,
  RefreshCw,
  UserRoundCheck,
  Users,
  WalletCards,
} from "lucide-react";

type DashboardTab = "ENCONTRISTAS" | "ENCONTREIROS" | "EVENTOS" | "EQUIPES";

type Evento = {
  id: string;
  name: string;
  edition: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
};

type FinancialMovement = {
  id: string;
  eventoId: string;
  type: "ENTRADA" | "SAIDA" | string;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: string;
};

type TeamCoordinator = {
  id: string;
  name: string;
  phone?: string;
};

type TeamSummaryItem = {
  id: string;
  name: string;
  status: string;
  coordinators: TeamCoordinator[];
  allocatedCount: number;
  openSlots?: number;
};

type DashboardSummary = {
  encontristas: {
    totalInscricoes: number;
    totalConvidados: number;
    totalPaisAdotivos: number;
    totalPadrinhos: number;
    pendencias: number;
    inscricoesAprovadas: number;
    complementacoesConcluidas: number;
    documentosPendentes: number;
    convidadosSemPaiAdotivo: number;
  };
  encontreiros: {
    total: number;
    ativos: number;
    inativos: number;
    comEquipe: number;
    semEquipe: number;
  };
  equipes: {
    total: number;
    ativas: number;
    alocados: number;
    semResponsavel: number;
    vagasAbertas: number;
    lista: TeamSummaryItem[];
  };
};

type DashboardData = {
  eventos: Evento[];
  movimentacoes: FinancialMovement[];
  summary: DashboardSummary;
};

const emptySummary: DashboardSummary = {
  encontristas: {
    totalInscricoes: 0,
    totalConvidados: 0,
    totalPaisAdotivos: 0,
    totalPadrinhos: 0,
    pendencias: 0,
    inscricoesAprovadas: 0,
    complementacoesConcluidas: 0,
    documentosPendentes: 0,
    convidadosSemPaiAdotivo: 0,
  },
  encontreiros: {
    total: 0,
    ativos: 0,
    inativos: 0,
    comEquipe: 0,
    semEquipe: 0,
  },
  equipes: {
    total: 0,
    ativas: 0,
    alocados: 0,
    semResponsavel: 0,
    vagasAbertas: 0,
    lista: [],
  },
};

const tabs: Array<{
  id: DashboardTab;
  label: string;
  description: string;
  icon: typeof Users;
}> = [
  { id: "ENCONTRISTAS", label: "Encontristas", description: "Inscrições, pais adotivos e convidados", icon: Users },
  { id: "ENCONTREIROS", label: "Encontreiros", description: "Servos, responsáveis e acompanhamento", icon: UserRoundCheck },
  { id: "EVENTOS", label: "Eventos", description: "Edições, períodos e financeiro", icon: CalendarDays },
  { id: "EQUIPES", label: "Equipes", description: "Áreas, responsáveis e distribuição", icon: HeartHandshake },
];

const eventStatusConfig: Record<string, { label: string; classes: string }> = {
  PLANNED: { label: "Planejado", classes: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  IN_PROGRESS: { label: "Em andamento", classes: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  FINISHED: { label: "Finalizado", classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  CANCELLED: { label: "Cancelado", classes: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function SummaryCard({ label, value, helper, tone = "default", icon: Icon }: { label: string; value: string; helper: string; tone?: "default" | "green" | "yellow" | "red" | "blue"; icon: typeof Users }) {
  const toneStyles = {
    default: { card: "border-slate-800 bg-slate-900/40", icon: "bg-slate-800 text-slate-300", value: "text-slate-100" },
    blue: { card: "border-blue-500/20 bg-blue-500/10", icon: "bg-blue-500/20 text-blue-400", value: "text-blue-400" },
    green: { card: "border-emerald-500/20 bg-emerald-500/10", icon: "bg-emerald-500/20 text-emerald-400", value: "text-emerald-400" },
    yellow: { card: "border-amber-500/20 bg-amber-500/10", icon: "bg-amber-500/20 text-amber-400", value: "text-amber-400" },
    red: { card: "border-rose-500/20 bg-rose-500/10", icon: "bg-rose-500/20 text-rose-400", value: "text-rose-400" },
  }[tone];

  return <article className={`flex items-start gap-4 rounded-2xl border p-5 backdrop-blur-sm transition-all hover:brightness-110 ${toneStyles.card}`}><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneStyles.icon}`}><Icon className="h-5 w-5" /></div><div><span className="text-sm font-medium text-slate-400">{label}</span><strong className={`block text-2xl font-bold ${toneStyles.value}`}>{value}</strong><small className="text-xs text-slate-500">{helper}</small></div></article>;
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Resumo</p><h2 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">{title}</h2><p className="mt-1 text-sm text-slate-400">{description}</p></div>;
}

function EncontristasTab({ summary }: { summary: DashboardSummary["encontristas"] }) {
  return <div className="space-y-8 animate-in fade-in-50 duration-200"><SectionTitle title="Encontristas" description="Acompanhe inscrições, pais adotivos e convidados do encontro." /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><SummaryCard label="Inscrições" value={String(summary.totalInscricoes)} helper={`${summary.inscricoesAprovadas} aprovadas`} icon={ClipboardList} tone="blue" /><SummaryCard label="Convidados" value={String(summary.totalConvidados)} helper={`${summary.complementacoesConcluidas} complementações concluídas`} icon={Users} /><SummaryCard label="Pais adotivos" value={String(summary.totalPaisAdotivos)} helper={`${summary.totalPadrinhos} registros de padrinhos`} icon={HeartHandshake} tone="green" /><SummaryCard label="Pendências" value={String(summary.pendencias + summary.documentosPendentes + summary.convidadosSemPaiAdotivo)} helper={`${summary.documentosPendentes} documentos pendentes`} icon={AlertTriangle} tone="yellow" /></div><div className="grid grid-cols-1 gap-6 md:grid-cols-3"><article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm"><h3 className="text-base font-bold text-slate-100">Inscrições</h3><p className="mt-1 text-xs text-slate-400">Visão geral dos grupos cadastrados.</p><ul className="mt-4 space-y-2 text-sm text-slate-300"><li>{summary.totalInscricoes} inscrições registradas.</li><li>{summary.inscricoesAprovadas} inscrições aprovadas.</li><li>{summary.pendencias} inscrições aguardando revisão.</li></ul></article><article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm"><h3 className="text-base font-bold text-slate-100">Pais adotivos</h3><p className="mt-1 text-xs text-slate-400">Dados reunidos a partir dos convidados.</p><ul className="mt-4 space-y-2 text-sm text-slate-300"><li>{summary.totalPaisAdotivos} nomes únicos.</li><li>{summary.convidadosSemPaiAdotivo} convidados sem informação.</li><li>Os nomes repetidos são contabilizados uma vez.</li></ul></article><article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm"><h3 className="text-base font-bold text-slate-100">Convidados</h3><p className="mt-1 text-xs text-slate-400">Acompanhamento dos cadastros.</p><ul className="mt-4 space-y-2 text-sm text-slate-300"><li>{summary.totalConvidados} convidados cadastrados.</li><li>{summary.complementacoesConcluidas} complementações concluídas.</li><li>{summary.documentosPendentes} documentos pendentes.</li></ul></article></div></div>;
}

function EncontreirosTab({ summary }: { summary: DashboardSummary["encontreiros"] }) {
  return <div className="space-y-8 animate-in fade-in-50 duration-200"><SectionTitle title="Encontreiros" description="Acompanhe servos, responsáveis, funções e disponibilidade." /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><SummaryCard label="Encontreiros" value={String(summary.total)} helper={`${summary.ativos} ativos`} icon={UserRoundCheck} tone="blue" /><SummaryCard label="Ativos" value={String(summary.ativos)} helper={`${summary.inativos} inativos`} icon={CheckCircle2} tone="green" /><SummaryCard label="Com equipe" value={String(summary.comEquipe)} helper="Alocados em uma equipe" icon={HeartHandshake} /><SummaryCard label="Sem equipe" value={String(summary.semEquipe)} helper="Precisam de distribuição" icon={AlertTriangle} tone="yellow" /></div><div className="grid grid-cols-1 gap-6 md:grid-cols-3"><article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"><h3 className="text-base font-bold text-slate-100">Distribuição</h3><p className="mt-1 text-xs text-slate-400">Alocação atual.</p><ul className="mt-4 space-y-2 text-sm text-slate-300"><li>{summary.comEquipe} com equipe definida.</li><li>{summary.semEquipe} sem equipe.</li><li>Confira a distribuição por evento.</li></ul></article><article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"><h3 className="text-base font-bold text-slate-100">Acompanhamento</h3><p className="mt-1 text-xs text-slate-400">Situação cadastral.</p><ul className="mt-4 space-y-2 text-sm text-slate-300"><li>{summary.ativos} ativos.</li><li>{summary.inativos} inativos.</li><li>Revise os contatos quando necessário.</li></ul></article><article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"><h3 className="text-base font-bold text-slate-100">Alertas</h3><p className="mt-1 text-xs text-slate-400">Situações para revisão.</p><ul className="mt-4 space-y-2 text-sm text-slate-300"><li>Encontreiros sem equipe.</li><li>Funções sem responsável.</li><li>Conflitos de escala.</li></ul></article></div></div>;
}

function EquipesTab({ summary }: { summary: DashboardSummary["equipes"] }) {
  const emptyTeams = summary.lista.filter(
    (team) => team.allocatedCount === 0,
  );

  const multiCoordinatorTeams = summary.lista.filter(
    (team) => team.coordinators.length >= 2,
  );

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      <SectionTitle
        title="Equipes"
        description="Visualize a composição e a distribuição de responsabilidades."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Equipes"
          value={String(summary.total)}
          helper={`${summary.ativas} ativas`}
          icon={HeartHandshake}
          tone="blue"
        />
        <SummaryCard
          label="Pessoas alocadas"
          value={String(summary.alocados)}
          helper="Encontreiros com equipe"
          icon={Users}
          tone="green"
        />
        <SummaryCard
          label="Equipes vazias"
          value={String(emptyTeams.length)}
          helper="Sem pessoas alocadas"
          icon={AlertTriangle}
          tone={emptyTeams.length > 0 ? "yellow" : "green"}
        />
        <SummaryCard
          label="Sem coordenação"
          value={String(summary.semResponsavel)}
          helper="Equipes para revisar"
          icon={AlertTriangle}
          tone="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Equipes sem pessoas alocadas
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                A equipe existe, mas ainda não possui integrantes.
              </p>
            </div>
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
              {emptyTeams.length}
            </span>
          </div>

          {emptyTeams.length === 0 ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              Todas as equipes possuem pessoas alocadas.
            </div>
          ) : (
            <div className="space-y-3">
              {emptyTeams.map((team) => (
                <div
                  className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
                  key={team.id}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <strong className="block text-sm text-slate-100">
                        {team.name}
                      </strong>
                      <span className="text-xs text-slate-400">
                        {team.coordinators.length} coordenador(es) · 0 pessoas alocadas
                      </span>
                    </div>
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Atenção
                    </span>
                  </div>

                  <div className="mt-4 border-t border-amber-500/10 pt-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Coordenadores
                    </p>
                    {team.coordinators.length === 0 ? (
                      <p className="text-xs text-rose-300">
                        Nenhum coordenador cadastrado.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {team.coordinators.map((coordinator) => (
                          <span
                            className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-200"
                            key={coordinator.id}
                          >
                            {coordinator.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Coordenação das equipes
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Equipes com dois ou mais coordenadores.
              </p>
            </div>
            <HeartHandshake className="h-5 w-5 text-indigo-400" />
          </div>

          {multiCoordinatorTeams.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-400">
              Nenhuma equipe com múltiplos coordenadores foi encontrada.
            </div>
          ) : (
            <div className="space-y-3">
              {multiCoordinatorTeams.map((team) => (
                <div
                  className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4"
                  key={team.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm text-slate-100">
                      {team.name}
                    </strong>
                    <span className="text-xs font-bold text-indigo-300">
                      {team.coordinators.length} coordenadores
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {team.coordinators.map((coordinator) => (
                      <span
                        className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300"
                        key={coordinator.id}
                      >
                        {coordinator.name}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-amber-300">
                    {team.allocatedCount === 0
                      ? "Possui coordenação, mas ainda não tem pessoas alocadas."
                      : `${team.allocatedCount} pessoa(s) alocada(s).`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

function EventosTab({ data, metrics, recentMovements }: { data: DashboardData; metrics: { receitas: number; despesas: number; saldo: number; pendingCount: number; activeEvents: Evento[]; confirmedMovementCount: number }; recentMovements: FinancialMovement[] }) {
  return <div className="space-y-8 animate-in fade-in-50 duration-200"><SectionTitle title="Eventos" description="Acompanhe eventos, períodos, situação e financeiro." /><section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><SummaryCard label="Eventos ativos" value={String(metrics.activeEvents.length)} helper={`${data.eventos.length} cadastrados no total`} icon={CalendarDays} tone="blue" /><SummaryCard label="Receitas confirmadas" value={money(metrics.receitas)} helper={`${metrics.confirmedMovementCount} movimentações confirmadas`} icon={ArrowUpRight} tone="green" /><SummaryCard label="Despesas confirmadas" value={money(metrics.despesas)} helper="Saídas registradas" icon={ArrowDownRight} tone="red" /><SummaryCard label="Saldo geral" value={money(metrics.saldo)} helper={`${metrics.pendingCount} pendências para revisar`} icon={WalletCards} tone={metrics.saldo >= 0 ? "green" : "red"} /></section><section className="grid grid-cols-1 gap-6 lg:grid-cols-2"><div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 shadow-xl"><div className="flex items-center justify-between border-b border-slate-800/60 p-5"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400">Acompanhamento</p><h2 className="text-lg font-bold text-slate-100">Eventos recentes</h2></div><Link href="/admin/eventos" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400">Ver todos <ExternalLink className="h-4 w-4" /></Link></div><div className="p-3">{data.eventos.length === 0 ? <div className="py-12 text-center text-sm text-slate-500">Nenhum evento cadastrado.</div> : <div className="space-y-1.5">{data.eventos.slice(0, 5).map((evento) => { const status = eventStatusConfig[evento.status] ?? { label: evento.status, classes: "bg-slate-500/10 text-slate-400 border-slate-500/20" }; return <Link key={evento.id} href={`/admin/eventos/${evento.id}`} className="group flex flex-col items-start gap-4 rounded-xl p-3 hover:bg-slate-800/50 sm:flex-row sm:items-center"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400"><CalendarDays className="h-5 w-5" /></div><div className="flex-1"><strong className="block text-sm text-slate-200">{evento.name}</strong><span className="text-xs text-slate-400">{evento.edition} · {formatDate(evento.startDate)} — {formatDate(evento.endDate)}</span></div><span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${status.classes}`}>{status.label}</span></Link>; })}</div>}</div></div><div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 shadow-xl"><div className="flex items-center justify-between border-b border-slate-800/60 p-5"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400">Financeiro</p><h2 className="text-lg font-bold text-slate-100">Últimas movimentações</h2></div><CircleDollarSign className="h-5 w-5 text-indigo-400/50" /></div><div className="p-3">{recentMovements.length === 0 ? <div className="py-12 text-center text-sm text-slate-500">Nenhuma movimentação registrada.</div> : <div className="space-y-1.5">{recentMovements.map((movement) => { const isEntrada = movement.type === "ENTRADA"; return <div key={movement.id} className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-800/50"><div className="flex items-center gap-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isEntrada ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>{isEntrada ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}</div><div><strong className="block max-w-[180px] truncate text-sm text-slate-200">{movement.description}</strong><span className="text-xs text-slate-400">{movement.category} · {formatDate(movement.date)}</span></div></div><div className="text-right"><strong className={`text-sm ${isEntrada ? "text-emerald-400" : "text-rose-400"}`}>{isEntrada ? "+" : "-"}{money(movement.amount)}</strong><span className="block text-[10px] uppercase tracking-wider text-slate-500">{movement.status}</span></div></div>; })}</div>}</div></div></section><section className="grid grid-cols-1 gap-4 md:grid-cols-2"><div className="flex flex-col items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:flex-row"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400"><ClipboardList className="h-6 w-6" /></div><div><h3 className="text-base font-bold text-slate-100">Inscrições</h3><p className="mb-4 text-sm text-slate-400">Acesse os eventos para consultar convidados e inscrições.</p><Link href="/admin/eventos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400">Acessar eventos <ExternalLink className="h-4 w-4" /></Link></div></div><div className="flex flex-col items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:flex-row"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400"><Users className="h-6 w-6" /></div><div><h3 className="text-base font-bold text-slate-100">Pendências financeiras</h3><p className="mb-4 text-sm text-slate-400">{metrics.pendingCount === 0 ? "Nenhuma movimentação pendente." : `${metrics.pendingCount} movimentação(ões) aguardando revisão.`}</p><Link href="/admin/eventos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">Revisar financeiro <ExternalLink className="h-4 w-4" /></Link></div></div></section></div>;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("EVENTOS");
  const [data, setData] = useState<DashboardData>({ eventos: [], movimentacoes: [], summary: emptySummary });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");

    try {
      const [eventosResponse, dashboardResponse] = await Promise.all([
        fetch("/api/admin/eventos", { cache: "no-store" }),
        fetch("/api/admin/dashboard", { cache: "no-store" }),
      ]);
      const eventosData = await eventosResponse.json();
      const dashboardData = await dashboardResponse.json();

      if (!eventosResponse.ok || !eventosData.ok) throw new Error(eventosData.error ?? "Não foi possível carregar os eventos.");
      if (!dashboardResponse.ok || !dashboardData.ok) throw new Error(dashboardData.error ?? "Não foi possível carregar os indicadores.");

      const eventos: Evento[] = eventosData.eventos ?? [];
      const financialResponses = await Promise.all(eventos.map(async (evento) => {
        const response = await fetch(`/api/admin/eventos/${evento.id}/financeiro`, { cache: "no-store" });
        const result = await response.json();
        return response.ok && result.ok ? result.movimentacoes ?? [] : [];
      }));

      setData({
        eventos,
        movimentacoes: financialResponses.flat(),
        summary: {
          ...emptySummary,
          ...dashboardData,
          equipes: {
            ...emptySummary.equipes,
            ...dashboardData.equipes,
            lista: dashboardData.equipes?.lista ?? [],
          },
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar o resumo.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { void loadDashboard(); }, []);

  const metrics = useMemo(() => {
    const confirmed = data.movimentacoes.filter((movement) => movement.status === "CONFIRMADO");
    const receitas = confirmed.filter((movement) => movement.type === "ENTRADA").reduce((total, movement) => total + movement.amount, 0);
    const despesas = confirmed.filter((movement) => movement.type === "SAIDA").reduce((total, movement) => total + movement.amount, 0);
    const pendingCount = data.movimentacoes.filter((movement) => movement.status === "PENDENTE").length;
    const activeEvents = data.eventos.filter((evento) => evento.status === "PLANNED" || evento.status === "IN_PROGRESS");
    return { receitas, despesas, saldo: receitas - despesas, pendingCount, activeEvents, confirmedMovementCount: confirmed.length };
  }, [data]);

  const recentMovements = useMemo(() => [...data.movimentacoes].sort((left, right) => `${right.date}-${right.id}`.localeCompare(`${left.date}-${left.id}`)).slice(0, 6), [data.movimentacoes]);

  if (loading) return <div className="flex min-h-[400px] items-center justify-center"><div className="flex flex-col items-center gap-3 text-slate-400"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /><p className="text-sm font-medium">Carregando resumo do sistema...</p></div></div>;

  return <div className="mx-auto max-w-7xl space-y-8"><header className="flex flex-col gap-6 border-b border-slate-800/60 pb-6 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-400">Visão geral</p><h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">Resumo do sistema</h1><p className="mt-2 text-slate-400">Acompanhe eventos, inscrições e organização em um só lugar.</p></div><div className="flex items-center gap-3"><button disabled={refreshing} onClick={() => void loadDashboard(true)} type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? "Atualizando..." : "Atualizar"}</button><Link href="/admin/eventos/novo" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-600"><Plus className="h-4 w-4" />Novo evento</Link></div></header>{error && <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200"><AlertCircle className="h-5 w-5 shrink-0 text-rose-400" /><p>{error}</p></div>}<nav className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{tabs.map((tab) => { const Icon = tab.icon; const active = activeTab === tab.id; return <button key={tab.id} onClick={() => setActiveTab(tab.id)} type="button" className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all backdrop-blur-md ${active ? "border-indigo-500/50 bg-indigo-600/15 text-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30" : "border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:bg-slate-800/40 hover:text-slate-200"}`}><div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"}`}><Icon className="h-4 w-4" /></div><div><strong className="block text-sm font-bold text-slate-100">{tab.label}</strong><small className="block text-xs text-slate-400">{tab.description}</small></div></button>; })}</nav><div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-3 text-xs font-medium text-slate-400"><BarChart3 className="h-4 w-4 text-indigo-400" /><span>{tabs.find((tab) => tab.id === activeTab)?.description}</span></div>{activeTab === "ENCONTRISTAS" && <EncontristasTab summary={data.summary.encontristas} />}{activeTab === "ENCONTREIROS" && <EncontreirosTab summary={data.summary.encontreiros} />}{activeTab === "EVENTOS" && <EventosTab data={data} metrics={metrics} recentMovements={recentMovements} />}{activeTab === "EQUIPES" && <EquipesTab summary={data.summary.equipes} />}</div>;
}