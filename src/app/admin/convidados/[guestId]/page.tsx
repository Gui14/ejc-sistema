import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GuestAdminEditForm } from "@/features/admin/guest-admin-edit-form";
import { requireAdmin } from "@/lib/auth/require-admin";

type GuestPageProps = {
  params: Promise<{
    guestId: string;
  }>;
};

export default async function AdminGuestPage({
  params,
}: GuestPageProps) {
  await requireAdmin();

  const { guestId } = await params;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <Link
          href="/admin/encontristas/convidados"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <h1 className="mt-5 text-3xl font-black">
          Editar convidado
        </h1>

        <GuestAdminEditForm guestId={guestId} />
      </div>
    </main>
  );
}