"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Trash2,
  AlertCircle,
  Loader2,
  User,
  Users,
  Phone,
  CornerDownRight,
  MessageSquare,
  CheckCircle2,
  Clock,
} from "lucide-react";

type AdminSponsorGuest = {
  id: string;
  name: string;
  phone: string;
  registrationToken: string;
  registrationUrl: string;
  completed: boolean;
};

type AdminSponsor = {
  id: string;
  name: string;
  phone: string;
  createdBy: string;
  guests: AdminSponsorGuest[];
};

type Props = {
  sponsors: AdminSponsor[];
};

export function AdminSponsorsTable({ sponsors: initialSponsors }: Props) {
  const router = useRouter();
  const [sponsors, setSponsors] = useState<AdminSponsor[]>(initialSponsors);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredSponsors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return sponsors;
    }

    return sponsors.filter((sponsor) => {
      const sponsorText = [sponsor.name, sponsor.phone, sponsor.createdBy]
        .join(" ")
        .toLowerCase();

      const guestText = sponsor.guests
        .map((guest) =>
          [guest.name, guest.phone, guest.registrationToken].join(" ")
        )
        .join(" ")
        .toLowerCase();

      return (
        sponsorText.includes(normalizedQuery) ||
        guestText.includes(normalizedQuery)
      );
    });
  }, [query, sponsors]);

  function getWhatsAppUrl(
    phone: string,
    name: string,
    registrationUrl: string
  ) {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return null;

    const message =
      `Olá, ${name}!\n\n` +
      `Para completar seu cadastro do EJC, ` +
      `acesse este link:\n${registrationUrl}`;

    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  }

  async function handleDeleteSponsor(sponsorId: string, sponsorName: string) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o Pai adotivo ${sponsorName}?`
    );

    if (!confirmed) return;

    setDeletingId(sponsorId);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/padrinhos/${encodeURIComponent(sponsorId)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Não foi possível excluir o Pai adotivo."
        );
      }

      setSponsors((prev) => prev.filter((s) => s.id !== sponsorId));
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Erro ao excluir Pai adotivo."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Barra de Filtro */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por Pai adotivo, convidado ou telefone..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      {/* Alerta de Erro */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-rose-400 hover:underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Tabela de Padrinhos */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Pessoa</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4">Status / Convidados</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            {filteredSponsors.map((sponsor) => (
              <tbody
                key={sponsor.id}
                className="divide-y divide-slate-800/60 border-b border-slate-800"
              >
                {/* Linha Principal: Pai Adotivo */}
                <tr className="bg-slate-800/30 transition-colors hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-semibold text-slate-100">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-indigo-400" />
                      <span>{sponsor.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                    {sponsor.phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                        {sponsor.phone}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                      Pai Adotivo
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {sponsor.createdBy || "—"}
                  </td>

                  <td className="px-6 py-4 text-slate-300 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {sponsor.guests.length}{" "}
                        {sponsor.guests.length === 1
                          ? "convidado"
                          : "convidados"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteSponsor(sponsor.id, sponsor.name)
                      }
                      disabled={deletingId === sponsor.id}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Excluir Pai Adotivo"
                    >
                      {deletingId === sponsor.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {deletingId === sponsor.id ? "Excluindo..." : "Excluir"}
                      </span>
                    </button>
                  </td>
                </tr>

                {/* Sub-linhas: Convidados */}
                {sponsor.guests.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-3 pl-12 text-xs italic text-slate-500"
                    >
                      Nenhum convidado vinculado a este Pai adotivo.
                    </td>
                  </tr>
                )}

                {sponsor.guests.map((guest) => {
                  const whatsappUrl = getWhatsAppUrl(
                    guest.phone,
                    guest.name,
                    guest.registrationUrl
                  );

                  return (
                    <tr
                      key={guest.id}
                      className="bg-slate-900/30 transition-colors hover:bg-slate-800/20"
                    >
                      <td className="px-6 py-3 pl-10 text-slate-300">
                        <div className="flex items-center gap-2">
                          <CornerDownRight className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-medium text-slate-200">
                            {guest.name || "Sem nome"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-3 text-xs font-mono text-slate-400">
                        {guest.phone || "—"}
                      </td>

                      <td className="px-6 py-3">
                        <span className="text-xs uppercase tracking-wide text-slate-500">
                          Convidado
                        </span>
                      </td>

                      <td className="px-6 py-3 text-slate-500">—</td>

                      <td className="px-6 py-3">
                        {guest.completed ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Preenchido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                            <Clock className="h-3 w-3" />
                            Pendente
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3 text-right">
                        {whatsappUrl ? (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Enviar WhatsApp
                          </a>
                        ) : (
                          <span className="text-xs text-rose-400/80">
                            Telefone ausente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ))}

            {filteredSponsors.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-slate-300">
                      Nenhum Pai adotivo ou convidado encontrado.
                    </p>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}