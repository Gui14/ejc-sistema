import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminGuestsbetter } from "@/features/admin/admin-repository";
import { AdminGuestsTable } from "@/features/admin/admin-guests-table";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    status?: string;
    query?: string;
  }>;
};

export default async function AdminGuestsPage({ searchParams }: Props) {
  await requireAdmin();

  // Aguarda os parâmetros para Next.js 15+ (Promise.resolve em 14)
  const params = await searchParams;

  const guests = await getAdminGuestsbetter();

  return (
    <div className="space-y-6">
      {/* Apenas enviamos a tabela, o header já é gerenciado pelo Layout de Encontristas */}
      <AdminGuestsTable
        guests={guests}
        initialStatus={params.status ?? "ALL"}
        initialQuery={params.query ?? ""}
      />
    </div>
  );
}