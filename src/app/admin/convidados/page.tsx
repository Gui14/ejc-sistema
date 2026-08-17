import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminGuests, getAdminGuestsbetter } from "@/features/admin/admin-repository";
import { AdminGuestsTable } from "@/features/admin/admin-guests-table";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    status?: string;
    query?: string;
  }>;
};

export default async function AdminGuestsPage({
  searchParams,
}: Props) {
  await requireAdmin();

  const params = await searchParams;

  const guests =
    await getAdminGuestsbetter();

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div>
        <h1 className="text-3xl font-black">
          Convidados
        </h1>

        <p className="mt-2 text-sm text-white/50">
          Consulte convidados, padrinhos, status e links de preenchimento.
        </p>
      </div>

      <AdminGuestsTable
        guests={guests}
        initialStatus={params.status ?? "ALL"}
        initialQuery={params.query ?? ""}
      />
    </main>
  );
}