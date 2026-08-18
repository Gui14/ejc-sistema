"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, UserPlus, Heart, Users } from "lucide-react";

const tabs = [
  {
    href: "/admin/encontristas/inscricoes",
    label: "Inscrições",
    icon: ClipboardList,
  },
  {
    href: "/admin/encontristas/convidados",
    label: "Convidados",
    icon: UserPlus,
  },
  {
    href: "/admin/encontristas/padrinhos",
    label: "Pais adotivos",
    icon: Heart,
  },
];

export default function EncontristasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
          <Users className="h-3.5 w-3.5" />
          Gestão de Encontristas
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Encontristas
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Gerencie as inscrições ativas, dados de convidados e alocação dos pais adotivos.
        </p>
      </div>

      {/* Navegação por Abas */}
      <nav className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/50 p-1.5 backdrop-blur-md sm:inline-flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Conteúdo Dinâmico da Sub-Rota */}
      <div>{children}</div>
    </div>
  );
}