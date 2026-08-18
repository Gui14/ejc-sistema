import Link from "next/link";
import { notFound } from "next/navigation";

import { MembroEquipeEditForm } from "@/features/equipes/membro-equipe-edit-form";
import {
  getMembroEquipeById,
} from "@/features/equipes/membros-equipe-repository";
import {
  getEquipeById,
} from "@/features/equipes/equipes-repository";

type PageProps = {
  params: Promise<{
    equipeId: string;
    membroId: string;
  }>;
};

export default async function EditarMembroEquipePage({
  params,
}: PageProps) {
  const {
    equipeId,
    membroId,
  } = await params;

  const [equipe, membro] =
    await Promise.all([
      getEquipeById(equipeId),
      getMembroEquipeById(membroId),
    ]);

  if (
    !equipe ||
    !membro ||
    membro.equipeId !== equipeId
  ) {
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

        <MembroEquipeEditForm
          equipeId={equipe.id}
          membro={membro}
        />
      </div>
    </main>
  );
}