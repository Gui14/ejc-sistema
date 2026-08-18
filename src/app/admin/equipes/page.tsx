import Link from "next/link";

import {
  getEquipesComQuantidadeDePessoas,
} from "@/features/equipes/equipes-repository";
import { EquipesTable } from "@/features/equipes/equipes-table";

import {
  EquipeMembrosFilters,
} from "@/features/equipes/equipe-membros-filtros";

export default async function AdminEquipesPage() {
  const equipes = await getEquipesComQuantidadeDePessoas();

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
              Administração
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Equipes
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-white/60">
              Organize as equipes de trabalho e acompanhe seus integrantes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/api/admin/equipes/exportar-pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-500/15 px-5 py-3 text-sm font-black text-cyan-200 transition hover:bg-cyan-500/25"
            >
              Exportar PDF
            </a>

            <Link
              href="/admin/equipes/nova"
              className="inline-flex items-center justify-center rounded-xl bg-pink-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-pink-300"
            >
              Nova equipe
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <EquipesTable equipes={equipes} />
        </div>
      </div>
    </main>
  );
}