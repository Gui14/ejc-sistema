import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Plus,
  UserRound,
  Users,
} from "lucide-react";

import {
  EquipeMembrosFilters,
  type EquipeMemberRow,
} from "@/features/equipes/equipe-membros-filtros";
import {
  getEquipeById,
} from "@/features/equipes/equipes-repository";
import {
  getMembrosByEquipeId,
} from "@/features/equipes/membros-equipe-repository";
import {
  getPessoasEquipe,
} from "@/features/equipes/pessoas-equipe-repository";

type PageProps = {
  params: Promise<{
    equipeId: string;
  }>;
};

export default async function EquipeDetalhesPage({
  params,
}: PageProps) {
  const { equipeId } = await params;

  const equipe = await getEquipeById(equipeId);

  if (!equipe) {
    notFound();
  }

  const [membros, pessoas] = await Promise.all([
    getMembrosByEquipeId(equipeId),
    getPessoasEquipe(),
  ]);

  const pessoasMap = new Map(
    pessoas.map((pessoa) => [pessoa.id, pessoa]),
  );

  const membrosComPessoa: EquipeMemberRow[] = membros.map(
    (membro) => {
      const pessoa = pessoasMap.get(
        membro.pessoaEquipeId,
      );

      return {
        id: membro.id,
        equipeId: membro.equipeId,
        name: pessoa?.name ?? "Pessoa não encontrada",
        whatsapp: pessoa?.whatsapp ?? "",
        email: pessoa?.email ?? "",
        role: membro.role,
        isCoordinator: membro.isCoordinator,
        registrationStatus:
          pessoa?.registrationStatus ??
          "WITHOUT_REGISTRATION",
        pessoaEquipeId: membro.pessoaEquipeId,
      };
    },
  );

  const coordinatorCount = membrosComPessoa.filter(
    (membro) => membro.isCoordinator,
  ).length;

  const pendingCount = membrosComPessoa.filter(
    (membro) =>
      membro.registrationStatus !== "COMPLETED",
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin/equipes"
              className="inline-flex items-center gap-2 text-sm font-bold text-white/55 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para equipes
            </Link>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
              Equipe
            </p>

            <h1 className="mt-3 text-3xl font-black">
              {equipe.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-white/60">
              {equipe.description ||
                "Nenhuma descrição cadastrada."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/equipes/${encodeURIComponent(
                equipe.id,
              )}/editar`}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
              Editar equipe
            </Link>

            <Link
              href={`/admin/equipes/${encodeURIComponent(
                equipe.id,
              )}/membros/novo`}
              className="inline-flex items-center gap-2 rounded-xl bg-pink-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-pink-300"
            >
              <Plus className="h-4 w-4" />
              Adicionar pessoa
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-4">
          <SummaryCard
            icon={<Users className="h-5 w-5" />}
            label="Membros"
            value={String(membrosComPessoa.length)}
          />

          <SummaryCard
            icon={<UserRound className="h-5 w-5" />}
            label="Coordenadores"
            value={String(coordinatorCount)}
          />

          <SummaryCard
            label="Pendências"
            value={String(pendingCount)}
          />

          <SummaryCard
            label="Status"
            value={
              equipe.status === "ACTIVE"
                ? "Ativa"
                : "Inativa"
            }
          />
        </div>

        <EquipeMembrosFilters
          equipeId={equipe.id}
          membros={membrosComPessoa}
        />
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-2 text-cyan-200">
        {icon}
        <p className="text-xs font-bold uppercase tracking-wider text-white/45">
          {label}
        </p>
      </div>

      <p className="mt-3 text-3xl font-black text-white">
        {value}
      </p>
    </div>
  );
}