import Link from "next/link";
import { notFound } from "next/navigation";

import { MembroEquipeForm } from "@/features/equipes/membro-equipe-form";
import {
  getEquipeById,
} from "@/features/equipes/equipes-repository";

type PageProps = {
  params: Promise<{
    equipeId: string;
  }>;
};

export default async function NovoMembroEquipePage({
  params,
}: PageProps) {
  const { equipeId } = await params;

  const equipe = await getEquipeById(equipeId);

  if (!equipe) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href={`/admin/equipes/${encodeURIComponent(
              equipe.id,
            )}`}
            className="text-sm font-bold text-white/55 transition hover:text-white"
          >
            ← Voltar para {equipe.name}
          </Link>
        </div>

        <MembroEquipeForm equipeId={equipe.id} />
      </div>
    </main>
  );
}