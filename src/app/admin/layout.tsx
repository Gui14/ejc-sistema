import Link from "next/link";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <Link
            href="/admin/inscricoes"
            className="shrink-0 text-lg font-black tracking-tight"
          >
            EJC Admin
          </Link>

          <nav className="flex items-center gap-2 overflow-x-auto">
            <Link
              href="/admin/inscricoes"
              className="whitespace-nowrap rounded-xl px-3 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              Inscrições
            </Link>

            <Link
              href="/admin/padrinhos"
              className="whitespace-nowrap rounded-xl px-3 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              Pais adotivos
            </Link>

            <Link
              href="/admin/convidados"
              className="whitespace-nowrap rounded-xl px-3 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              Convidados
            </Link>

            <Link
              href="/"
              className="whitespace-nowrap rounded-xl border border-white/10 px-3 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              Sair
            </Link>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}