import { AdminDashboard } from "@/features/admin/admin-dashboard";
import { requireAdmin } from "@/lib/auth/require-admin";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <header className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-pink-300">
              Painel EJC
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Dashboard
            </h1>
          </div>

          <p className="text-sm text-white/50">
            Usuário: {session.username}
          </p>
        </header>

        <AdminDashboard />
        <div className="mt-8">
        <Link
            href="/admin/inscricoes"
            className="inline-flex rounded-2xl border border-pink-300/30 bg-pink-400/10 px-5 py-3 text-sm font-bold text-pink-100 transition hover:bg-pink-400/20"
        >
            Ver inscrições
        </Link>
        </div>
      </div>
    </main>
  );
}