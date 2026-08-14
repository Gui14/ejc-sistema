import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminFilesPage() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <h1 className="text-3xl font-black">
        Arquivos
      </h1>

      <p className="mt-2 text-sm text-white/50">
        Consulte fotos, RGs e demais arquivos enviados.
      </p>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-white/60">
          A consulta de arquivos será implementada na próxima etapa.
        </p>

        <Link
          href="/admin/inscricoes"
          className="mt-5 inline-block rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950"
        >
          Ir para inscrições
        </Link>
      </div>
    </main>
  );
}