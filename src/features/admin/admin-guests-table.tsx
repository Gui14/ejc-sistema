"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  GuestWhatsAppButton,
} from "./guest-whatsapp-button";

type AdminGuest = {
  id: string;
  groupId: string;
  sponsorId: string;
  sponsorName: string;
  name: string;
  phone: string;
  profile: string;
  otherChurchName: string;
  status: string;
  registrationToken: string;
  registrationUrl: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  guests: AdminGuest[];
  initialStatus: string;
  initialQuery: string;
};

const statusOptions = [
  {
    value: "ALL",
    label: "Todos",
  },
  {
    value: "COMPLETED",
    label: "Preenchidos",
  },
  {
    value: "PENDING",
    label: "Pendentes",
  },
];

export function AdminGuestsTable({
  guests,
  initialStatus,
  initialQuery,
}: Props) {
  const router = useRouter();

  const [query, setQuery] =
    useState(initialQuery);

  const [status, setStatus] =
    useState(initialStatus);

  const filteredGuests = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    return guests.filter((guest) => {
      const matchesStatus =
        status === "ALL" ||
        (status === "COMPLETED" &&
          guest.completed) ||
        (status === "PENDING" &&
          !guest.completed);

      const searchableText = [
        guest.name,
        guest.phone,
        guest.sponsorName,
        guest.profile,
        guest.groupId,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        searchableText.includes(
          normalizedQuery,
        );

      return (
        matchesStatus &&
        matchesQuery
      );
    });
  }, [guests, query, status]);

  function updateFilters(
    nextQuery: string,
    nextStatus: string,
  ) {
    const params = new URLSearchParams();

    if (nextQuery.trim()) {
      params.set(
        "query",
        nextQuery.trim(),
      );
    }

    if (nextStatus !== "ALL") {
      params.set(
        "status",
        nextStatus,
      );
    }

    const queryString =
      params.toString();

    router.replace(
      queryString
        ? `/admin/convidados?${queryString}`
        : "/admin/convidados",
    );
  }

  function handleQueryChange(
    value: string,
  ) {
    setQuery(value);
    updateFilters(value, status);
  }

  function handleStatusChange(
    value: string,
  ) {
    setStatus(value);
    updateFilters(query, value);
  }

  return (
    <section className="mt-8">
      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:grid-cols-[1fr_220px]">
        <input
          value={query}
          onChange={(event) =>
            handleQueryChange(
              event.target.value,
            )
          }
          placeholder="Buscar por nome, WhatsApp, pai adotivo ou grupo"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
        />

        <select
          value={status}
          onChange={(event) =>
            handleStatusChange(
              event.target.value,
            )
          }
          className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
        >
          {statusOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-white/50">
        <span>
          {filteredGuests.length} convidado(s)
        </span>

        <span>
          {filteredGuests.filter(
            (guest) => guest.completed,
          ).length}{" "}
          preenchido(s)
        </span>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-5 py-4">
                  Convidado
                </th>

                <th className="px-5 py-4">
                  WhatsApp
                </th>

                <th className="px-5 py-4">
                  Pai adotivo
                </th>

                <th className="px-5 py-4">
                  Perfil
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

                <th className="px-5 py-4">
                  Ação
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {filteredGuests.map((guest) => (
                <tr
                  key={guest.id}
                  className="bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <div className="font-bold text-white">
                      {guest.name ||
                        "Sem nome"}
                    </div>

                    <div className="mt-1 text-xs text-white/35">
                      {guest.groupId}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-white/60">
                    {guest.phone || "—"}
                  </td>

                  <td className="px-5 py-4 text-white/60">
                    {guest.sponsorName}
                  </td>

                  <td className="px-5 py-4 text-white/60">
                    {guest.profile || "—"}

                    {guest.otherChurchName && (
                      <div className="mt-1 text-xs text-white/35">
                        {guest.otherChurchName}
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4">
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

                  <td className="px-5 py-4">
                    <div className="flex min-w-[230px] flex-col items-stretch gap-2">
                      <Link
                        href={`/admin/convidados/${encodeURIComponent(
                          guest.id,
                        )}`}
                        prefetch={false}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-pink-300/20 bg-pink-400/10 px-3 py-2 text-center text-xs font-semibold text-pink-100 transition hover:bg-pink-400/20"
                      >
                        Editar convidado
                      </Link>

                      <GuestWhatsAppButton
                        name={guest.name}
                        phone={guest.phone}
                        registrationUrl={
                          guest.registrationUrl
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {filteredGuests.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-white/40"
                  >
                    Nenhum convidado encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}