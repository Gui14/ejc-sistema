import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminSponsors } from "@/features/admin/admin-repository";
import { AdminSponsorsTable } from "@/features/admin/admin-sponsors-table";

export const dynamic = "force-dynamic";

export default async function AdminSponsorsPage() {
  await requireAdmin();

  const sponsors = await getAdminSponsors();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

        <div className="mt-6">
          <h1 className="text-3xl font-black">
            Padrinhos
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Acompanhe os padrinhos e o preenchimento dos convidados.
          </p>
        </div>

        <AdminSponsorsTable sponsors={sponsors} />
      </div>
    </main>
  );
}