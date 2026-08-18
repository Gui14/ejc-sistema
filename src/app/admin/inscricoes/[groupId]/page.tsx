import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { RegistrationDetails } from "@/features/admin/registration-details";
import { requireAdmin } from "@/lib/auth/require-admin";

type RegistrationDetailsPageProps = {
  params: Promise<{
    groupId: string;
  }>;
};

export default async function RegistrationDetailsPage({
  params,
}: RegistrationDetailsPageProps) {
  await requireAdmin();

  const { groupId } = await params;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <header className="border-b border-white/10 pb-6">
          <Link
            href="/admin/encontristas/inscricoes"
            className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para inscrições
          </Link>

          <h1 className="mt-5 text-3xl font-black">
            Detalhes da inscrição
          </h1>

          <p className="mt-2 break-all text-sm text-white/50">
            {groupId}
          </p>
        </header>

        <RegistrationDetails groupId={groupId} />
      </div>
    </main>
  );
}