import { AdminDashboard } from "@/features/admin/admin-dashboard";
import { requireAdmin } from "@/lib/auth/require-admin";
import Link from "next/link";
import { User, ArrowRight, ClipboardList } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            Painel Geral
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Acompanhe em tempo real o resumo de inscrições e indicadores do evento.
          </p>
        </div>

        {/* Card do Usuário Logado */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 backdrop-blur-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/10">
            <User className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <span className="block text-slate-400">Conectado como</span>
            <span className="font-semibold text-slate-200">{session.username}</span>
          </div>
        </div>
      </div>

      {/* Componente de Gráficos e Métricas */}
      <AdminDashboard />

      {/* Seção de Ação Rápida */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Gerenciamento de Registros</h2>
            <p className="text-sm text-slate-400">
              Acesse a lista detalhada para filtrar, exportar ou editar os dados cadastrados.
            </p>
          </div>

          <Link
            href="/admin/encontristas/inscricoes"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-[0.98]"
          >
            <ClipboardList className="h-4 w-4" />
            <span>Ver todas as inscrições</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}