"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Edit, 
  Users, 
  Church 
} from "lucide-react";

import { GuestWhatsAppButton } from "./guest-whatsapp-button";

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
  { value: "ALL", label: "Todos os status" },
  { value: "COMPLETED", label: "Preenchidos" },
  { value: "PENDING", label: "Pendentes" },
];

export function AdminGuestsTable({ guests, initialStatus, initialQuery }: Props) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);

  const filteredGuests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return guests.filter((guest) => {
      const matchesStatus =
        status === "ALL" ||
        (status === "COMPLETED" && guest.completed) ||
        (status === "PENDING" && !guest.completed);

      const searchableText = [
        guest.name,
        guest.phone,
        guest.sponsorName,
        guest.profile,
        guest.groupId,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [guests, query, status]);

  function updateFilters(nextQuery: string, nextStatus: string) {
    const params = new URLSearchParams();

    if (nextQuery.trim()) {
      params.set("query", nextQuery.trim());
    }

    if (nextStatus !== "ALL") {
      params.set("status", nextStatus);
    }

    const queryString = params.toString();

    router.replace(
      queryString ? `/admin/encontristas/convidados?${queryString}` : "/admin/encontristas/convidados",
      { scroll: false } // Evita scroll top na digitação
    );
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    updateFilters(value, status);
  }

  function handleStatusChange(value: string) {
    setStatus(value);
    updateFilters(query, value);
  }

  const completedCount = filteredGuests.filter((g) => g.completed).length;

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center">
        
        {/* Input de Busca */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar por nome, telefone, padrinho ou grupo..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Select de Status */}
        <div className="relative w-full sm:w-56 shrink-0">
          <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-10 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Seta Customizada do Select */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Resumo de Resultados */}
      <div className="flex items-center justify-between px-1 text-sm font-medium">
        <span className="text-slate-400">
          Exibindo <span className="text-white">{filteredGuests.length}</span> convidados
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" />
          {completedCount} preenchidos
        </span>
      </div>

      {/* Container da Tabela */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Convidado</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Pai Adotivo / Grupo</th>
                <th className="px-6 py-4">Perfil Religioso</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="transition-colors hover:bg-slate-800/40">
                  {/* Coluna Convidado */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                        {guest.name ? guest.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100">
                          {guest.name || <span className="italic text-slate-500">Sem nome</span>}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Coluna Contato */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-300">
                      {guest.phone || "—"}
                    </span>
                  </td>

                  {/* Coluna Pai Adotivo e Grupo */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">{guest.sponsorName}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <Users className="h-3 w-3" />
                      Grupo {guest.groupId}
                    </div>
                  </td>

                  {/* Coluna Perfil Religioso */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
                      <Church className="h-3 w-3 text-slate-400" />
                      {guest.profile || "Não informado"}
                    </span>
                    {guest.otherChurchName && (
                      <div className="mt-1.5 text-xs text-slate-400">
                        {guest.otherChurchName}
                      </div>
                    )}
                  </td>

                  {/* Coluna Status */}
                  <td className="px-6 py-4">
                    {guest.completed ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Preenchido
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                        <Clock className="h-3.5 w-3.5" />
                        Pendente
                      </span>
                    )}
                  </td>

                  {/* Coluna Ações */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <GuestWhatsAppButton
                        name={guest.name}
                        phone={guest.phone}
                        registrationUrl={guest.registrationToken}
                      />
                      
                      <Link
                        href={`/admin/convidados/${encodeURIComponent(guest.id)}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                        title="Editar Convidado"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center justify-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50">
                        <Search className="h-6 w-6 text-slate-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-300">Nenhum convidado encontrado.</p>
                      <p className="mt-1 text-xs text-slate-500">Tente ajustar os filtros de busca ou status.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}