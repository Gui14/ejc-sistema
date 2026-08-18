import { EncontreiroPublicForm } from "@/features/encontreiros/encontreiro-public-form";

export default function EncontreirosPublicPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
          EJC
        </p>

        <h1 className="mt-3 text-3xl font-black">
          Inscrição de encontreiro
        </h1>

        <p className="mt-3 text-sm text-white/60">
          Preencha seus dados e envie o comprovante PIX da inscrição.
        </p>

        <EncontreiroPublicForm />
      </div>
    </main>
  );
}