import Link from "next/link";

import PessoaEquipeForm from "@/features/equipes/pessoa-equipe-form";

export default function NovaPessoaEquipePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/admin/equipe-pessoas"
            className="text-sm font-bold text-white/55 transition hover:text-white"
          >
            ← Voltar para pessoas da equipe
          </Link>
        </div>

        <PessoaEquipeForm />
      </div>
    </main>
  );
}