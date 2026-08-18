import { notFound } from "next/navigation";

import { EquipeForm } from "@/features/equipes/equipe-form";
import {
  getEquipeById,
} from "@/features/equipes/equipes-repository";

type PageProps = {
  params: Promise<{
    equipeId: string;
  }>;
};

export default async function AdminEquipeEditPage({
  params,
}: PageProps) {
  const { equipeId } = await params;

  const equipe =
    await getEquipeById(equipeId);

  if (!equipe) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <EquipeForm equipe={equipe} />
      </div>
    </main>
  );
}