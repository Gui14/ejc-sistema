"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export function AdminSponsorsTable({
  sponsors,
}: Props) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] =
    useState<string | null>(null);
  const [error, setError] =
    useState<string | null>(null);

  const filteredSponsors = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    if (!normalizedQuery) {
      return sponsors;
    }

    return sponsors.filter((sponsor) => {
      const sponsorText = [
        sponsor.name,
        sponsor.phone,
        sponsor.createdBy,
      ]
        .join(" ")
        .toLowerCase();

      const guestText = sponsor.guests
        .map((guest) =>
          [
            guest.name,
            guest.phone,
            guest.registrationToken,
          ].join(" "),
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
    registrationUrl: string,
  ) {
    const digits = phone.replace(
      /\D/g,
      "",
    );

    if (!digits) {
      return null;
    }

    const message =
      `Olá, ${name}!\n\n` +
      `Para completar seu cadastro do EJC, ` +
      `acesse este link:\n${registrationUrl}`;

    return `https://wa.me/${digits}?text=${encodeURIComponent(
      message,
    )}`;
  }

  async function handleDeleteSponsor(
    sponsorId: string,
    sponsorName: string,
  ) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o padrinho ${sponsorName}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(sponsorId);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/padrinhos/${encodeURIComponent(
          sponsorId,
        )}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível excluir o padrinho.",
        );
      }

      window.location.href = "/admin/padrinhos";
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Erro ao excluir padrinho.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-8">
      <div className="mb-5">
        <input
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Buscar padrinho, convidado ou telefone"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
        />
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-5 py-4">
                  Pessoa
                </th>
                <th className="px-5 py-4">
                  Telefone
                </th>
                <th className="px-5 py-4">
                  Tipo
                </th>
                <th className="px-5 py-4">
                  Responsável
                </th>
                <th className="px-5 py-4">
                  Status
                </th>
                <th className="px-5 py-4">
                  Ações
                </th>
              </tr>
            </thead>

            {filteredSponsors.map((sponsor) => (
              <tbody
                key={sponsor.id}
                className="divide-y divide-white/10"
              >
                <tr className="bg-white/[0.07]">
                  <td className="px-5 py-4 font-bold">
                    {sponsor.name}
                  </td>

                  <td className="px-5 py-4 text-white/60">
                    {sponsor.phone || "—"}
                  </td>

                  <td className="px-5 py-4 text-xs uppercase tracking-wide text-white/50">
                    Padrinho
                  </td>

                  <td className="px-5 py-4 text-white/60">
                    {sponsor.createdBy || "—"}
                  </td>

                  <td className="px-5 py-4 text-white/60">
                    {sponsor.guests.length}{" "}
                    {sponsor.guests.length === 1
                      ? "convidado"
                      : "convidados"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/padrinhos/${encodeURIComponent(
                          sponsor.id,
                        )}`}
                        className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                      >
                        Editar
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteSponsor(
                            sponsor.id,
                            sponsor.name,
                          )
                        }
                        disabled={
                          deletingId === sponsor.id
                        }
                        className="rounded-xl bg-red-500/15 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === sponsor.id
                          ? "Excluindo..."
                          : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>

                {sponsor.guests.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-5 pl-10 text-sm text-white/35"
                    >
                      Nenhum convidado vinculado a este padrinho.
                    </td>
                  </tr>
                )}

                {sponsor.guests.map((guest) => {
                  const whatsappUrl =
                    getWhatsAppUrl(
                      guest.phone,
                      guest.name,
                      guest.registrationUrl,
                    );

                  return (
                    <tr
                      key={guest.id}
                      className="bg-white/[0.02]"
                    >
                      <td className="px-5 py-3 pl-10 text-white/80">
                        <span className="mr-2 text-white/30">
                          ↳
                        </span>
                        {guest.name || "Sem nome"}
                      </td>

                      <td className="px-5 py-3 text-white/50">
                        {guest.phone || "—"}
                      </td>

                      <td className="px-5 py-3 text-xs uppercase tracking-wide text-white/35">
                        Convidado
                      </td>

                      <td className="px-5 py-3 text-white/30">
                        —
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={
                            guest.completed
                              ? "text-emerald-300"
                              : "text-amber-300"
                          }
                        >
                          {guest.completed
                            ? "Preenchido"
                            : "Pendente"}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        {whatsappUrl ? (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/25"
                          >
                            Enviar WhatsApp
                          </a>
                        ) : (
                          <span className="text-xs text-red-300">
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
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-white/40"
                  >
                    Nenhum padrinho ou convidado encontrado.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
    </section>
  );
}