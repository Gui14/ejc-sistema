import Link from "next/link";

import {
  getPessoasEquipe,
} from "@/features/equipes/pessoas-equipe-repository";
import { PessoasEquipeTable } from "@/features/equipes/pessoas-equipe-table";

export default async function AdminEquipePessoasPage() {
  const pessoas = await getPessoasEquipe();

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
              Pessoas da equipe
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Cadastro de pessoas
            </h1>

            <p className="mt-3 text-sm text-white/60">
              Cadastre pessoas antes de vinculá-las a uma equipe.
            </p>
          </div>

          <Link
            href="/admin/equipe-pessoas/nova"
            className="inline-flex items-center justify-center rounded-xl bg-pink-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-pink-300"
          >
            Nova pessoa
          </Link>
        </div>

        <div className="mt-8">
          <PessoasEquipeTable pessoas={pessoas} />
        </div>
      </div>
    </main>
  );
}