import type { ComponentType } from "react";
import { AlertTriangle, HeartHandshake, Users } from "lucide-react";

type SummaryCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: ComponentType<{ className?: string }>;
  tone: "blue" | "green" | "yellow" | "red";
};

function SummaryCard({ label, value, helper, icon: Icon, tone }: SummaryCardProps) {
  const toneClasses = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-300",
    green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    yellow: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    red: "border-rose-500/20 bg-rose-500/10 text-rose-300",
  } as const;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-100">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
        <div className={`rounded-xl border p-2.5 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

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

type EquipesSummary = {
  total: number;
  ativas: number;
  alocados: number;
  semResponsavel: number;
  vagasAbertas: number;
};

type EquipesTabProps = {
  summary: EquipesSummary;
  teams?: TeamSummaryItem[];
};

type SectionTitleProps = {
  title: string;
  description: string;
};

function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </div>
  );
}

export function EquipesTab({ summary, teams = [] }: EquipesTabProps) {
  const teamsWithoutAllocatedPeople = teams.filter(
    (team) => team.allocatedCount === 0,
  );

  const teamsWithMultipleCoordinators = teams.filter(
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
          value={String(teamsWithoutAllocatedPeople.length)}
          helper="Sem pessoas alocadas"
          icon={AlertTriangle}
          tone={teamsWithoutAllocatedPeople.length > 0 ? "yellow" : "green"}
        />
        <SummaryCard
          label="Sem responsável"
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
                Equipes criadas que ainda não receberam integrantes.
              </p>
            </div>
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
              {teamsWithoutAllocatedPeople.length}
            </span>
          </div>

          {teamsWithoutAllocatedPeople.length === 0 ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              Todas as equipes possuem pelo menos uma pessoa alocada.
            </div>
          ) : (
            <div className="space-y-3">
              {teamsWithoutAllocatedPeople.map((team) => (
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
                        Nenhuma pessoa alocada
                      </span>
                    </div>
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Atenção
                    </span>
                  </div>

                  {team.coordinators.length > 0 && (
                    <div className="mt-4 border-t border-amber-500/10 pt-3">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Coordenação cadastrada
                      </p>
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
                    </div>
                  )}
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
                Equipes com um ou mais coordenadores responsáveis.
              </p>
            </div>
            <HeartHandshake className="h-5 w-5 text-indigo-400" />
          </div>

          {teamsWithMultipleCoordinators.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-400">
              Nenhuma equipe com múltiplos coordenadores foi encontrada.
            </div>
          ) : (
            <div className="space-y-3">
              {teamsWithMultipleCoordinators.map((team) => (
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
                      ? "A equipe possui coordenação, mas ainda não tem pessoas alocadas."
                      : `${team.allocatedCount} pessoa(s) alocada(s).`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <h3 className="text-base font-bold text-slate-100">Composição</h3>
          <p className="mt-1 text-xs text-slate-400">
            Confira a situação das equipes.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>{summary.total} equipes cadastradas.</li>
            <li>{summary.ativas} equipes ativas.</li>
            <li>{summary.alocados} pessoas alocadas.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <h3 className="text-base font-bold text-slate-100">Distribuição</h3>
          <p className="mt-1 text-xs text-slate-400">
            Identifique necessidades de alocação.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>{teamsWithoutAllocatedPeople.length} equipes sem pessoas.</li>
            <li>{summary.vagasAbertas} equipes com vagas registradas.</li>
            <li>Confira os coordenadores antes de distribuir.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 backdrop-blur-sm">
          <h3 className="text-base font-bold text-slate-100">Avisos</h3>
          <p className="mt-1 text-xs text-slate-400">
            Situações que precisam de atenção.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>{summary.semResponsavel} equipes sem responsável.</li>
            <li>{teamsWithoutAllocatedPeople.length} equipes sem alocação.</li>
            <li>Verifique conflitos de função e escala.</li>
          </ul>
        </article>
      </div>
    </div>
  );
}