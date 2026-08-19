"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LogOut, ShieldCheck, Calendar, UserCog } from "lucide-react";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const NAV_ITEMS = [
  { href: "/admin/encontristas/inscricoes", label: "Encontristas", icon: Users },
  { href: "/admin/encontreiros", label: "Encontreiros", icon: UserCog },
  { href: "/admin/equipes", label: "Equipes", icon: Users },
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header com efeito de vidro fosco */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
          
          {/* Logo / Brand Badge */}
          <Link
            href="/admin/dashboard"
            className="group flex items-center gap-2.5 transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/20 transition group-hover:scale-105">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-indigo-200">
              EJC <span className="text-xs font-semibold text-indigo-400">Admin</span>
            </span>
          </Link>

          {/* Navegação */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-600/15 text-indigo-300 ring-1 ring-indigo-500/30"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            <div className="mx-2 h-4 w-px bg-slate-800" />

            {/* Sair */}
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm font-medium text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}