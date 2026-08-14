import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { RegistrationsTable } from "@/features/admin/registrations-table";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminRegistrationsPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <h1 className="mt-4 text-3xl font-black">
              Inscrições
            </h1>

            <p className="mt-2 text-white/55">
              Gerencie os grupos de inscrição e seus comprovantes.
            </p>
          </div>
        </header>

        <RegistrationsTable />
      </div>
    </main>
  );
}