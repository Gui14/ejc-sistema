import { requireAdmin } from "@/lib/auth/require-admin";
import { RegistrationsTable } from "@/features/admin/registrations-table";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <RegistrationsTable />
    </div>
  );
}