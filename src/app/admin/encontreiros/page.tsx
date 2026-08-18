import { requireAdmin } from "@/lib/auth/require-admin";
import { getEncontreiros } from "@/features/encontreiros/encontreiros-repository";
import { EncontreirosTable } from "@/features/encontreiros/encontreiros-table";
import Link from "next/link";
import { UserPlus, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEncontreirosPage() {
  await requireAdmin();

  const encontreiros = await getEncontreiros();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
              Encontreiros
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            Gerencie as pessoas interessadas em trabalhar na equipe do EJC.
          </p>
        </div>

        <Link
          href="/admin/encontreiros/novo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <UserPlus className="h-4 w-4" />
          <span>Adicionar encontreiro</span>
        </Link>
      </div>

      {/* Tabela de Encontreiros */}
      <EncontreirosTable encontreiros={encontreiros} />
    </main>
  );
}