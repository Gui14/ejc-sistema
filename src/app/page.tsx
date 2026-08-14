import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { EjcButton } from "@/components/ui/ejc-button";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090612]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(197,29,184,0.8),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(8,184,237,0.55),_transparent_35%),linear-gradient(135deg,_#26005c_0%,_#4310a2_45%,_#103dff_100%)]" />

      <div className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
      <div className="absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur">
              <Sparkles className="h-4 w-4 text-pink-300" />
              Encontro de Jovens com Cristo
            </div>

            <div className="mb-8">
              <Image
                src="/brand/ejc-logo-white.jpg"
                alt="Logo do EJC"
                width={320}
                height={120}
                className="h-auto w-52 object-contain object-left mix-blend-screen sm:w-64"
                priority
              />
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
              Um encontro
              <span className="block bg-gradient-to-r from-pink-300 via-pink-500 to-cyan-300 bg-clip-text text-transparent">
                que transforma.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Faça o cadastro do seu convidado para participar do EJC da Igreja
              Batista Teosópolis.
            </p>

            <div className="mt-8">
              <Link href="/inscricao">
                <EjcButton>
                  Começar inscrição
                  <ArrowRight className="ml-2 h-5 w-5" />
                </EjcButton>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="animate-float rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-2xl shadow-black/30 backdrop-blur-md">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-white/20 to-white/5 p-8">
                <div className="mb-12 flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-[0.25em] text-white/60">
                    EJC
                  </span>
                  <span className="rounded-full bg-pink-400/20 px-3 py-1 text-xs font-semibold text-pink-200">
                    2026
                  </span>
                </div>

                <p className="text-sm uppercase tracking-[0.2em] text-white/55">
                  EJC convida
                </p>

                <p className="mt-3 text-5xl font-black leading-none sm:text-6xl">
                  Venha
                  <span className="block text-pink-400">viver.</span>
                </p>

                <div className="mt-12 h-1 w-24 rounded-full bg-gradient-to-r from-pink-400 to-cyan-300" />

                <p className="mt-5 text-sm leading-6 text-white/65">
                  Igreja Batista Teosópolis
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}