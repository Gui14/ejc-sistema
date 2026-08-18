import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdmin } from "@/lib/auth/require-admin";
import { NewEncontreiroForm } from "@/features/encontreiros/new-encontreiro-form";

export default async function NewEncontreiroPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <Link
          href="/admin/encontreiros"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para encontreiros
        </Link>

        <h1 className="mt-6 text-3xl font-black">
          Adicionar encontreiro
        </h1>

        <p className="mt-2 text-sm text-white/50">
          Cadastre manualmente uma pessoa interessada em trabalhar no EJC.
        </p>

        <NewEncontreiroForm />
      </div>
    </main>
  );
}