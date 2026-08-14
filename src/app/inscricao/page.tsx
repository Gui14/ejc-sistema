import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RegistrationForm } from "@/features/inscricoes/registration-form";

export default function RegistrationPage() {
  return (
    <main className="min-h-screen bg-[#090612]">
      <div className="fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,_rgba(197,29,184,0.55),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(8,184,237,0.4),_transparent_35%),linear-gradient(135deg,_#26005c_0%,_#4310a2_45%,_#103dff_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-5 py-8 sm:px-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Início
          </Link>

          <Image
            src="/brand/ejc-logo-white.jpg"
            alt="Logo do EJC"
            width={180}
            height={68}
            className="h-auto w-28 object-contain object-right mix-blend-screen sm:w-36"
          />
        </header>

        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-200">
            EJC convida
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            Faça uma inscrição
            <span className="block bg-gradient-to-r from-pink-300 to-cyan-300 bg-clip-text text-transparent">
              especial.
            </span>
          </h1>
          <p className="mt-4 text-white/70">
            Preencha os dados com atenção. O administrador poderá revisar e
            editar as informações posteriormente.
          </p>
        </div>

        <RegistrationForm />
      </div>
    </main>
  );
}