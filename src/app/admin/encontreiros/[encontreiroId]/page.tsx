import { notFound } from "next/navigation";

import { EncontreiroEditForm } from "@/features/encontreiros/encontreiro-edit-form";
import {
  getEncontreiroById,
} from "@/features/encontreiros/encontreiros-repository";

type PageProps = {
  params: Promise<{
    encontreiroId: string;
  }>;
};

export default async function AdminEncontreiroPage({
  params,
}: PageProps) {
  const { encontreiroId } = await params;

  const encontreiro =
    await getEncontreiroById(
      encontreiroId,
    );

  if (!encontreiro) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <EncontreiroEditForm
          encontreiro={encontreiro}
        />
      </div>
    </main>
  );
}