import { AdminLoginForm } from "@/features/admin/admin-login-form";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-100 antialiased">
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-indigo-600/20 via-violet-600/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

      <div className="w-full max-w-md space-y-8">
        {/* Header do Card */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-500/25 ring-1 ring-white/20">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>

          <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-300">
            Painel EJC
          </span>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Acesso Restrito
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Digite suas credenciais para gerenciar inscrições e encontreiros.
          </p>
        </div>

        {/* Formulário */}
        <AdminLoginForm />

        <p className="text-center text-xs text-slate-500">
          Encontro de Jovens com Cristo &copy; {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}