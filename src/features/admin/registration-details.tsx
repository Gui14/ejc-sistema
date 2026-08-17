"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ExternalLink,
  FileText,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";

type Group = {
  groupId: string;
  email: string;
  sponsorName: string;
  sponsorWhatsapp: string;
  guestCount: number;
  expectedAmount: number;
  pixStatus: string;
  approvedAmount: number;
  receiptUrl: string;
  createdAt: string;
  updatedAt: string;
};

type Guest = {
  id: string;
  name: string;
  whatsapp: string;
  church: string;
  otherChurch: string;
  profile: string;
  foodRestriction: string;
  personPhotoUrl: string;
  rgPhotoUrl: string;
  completionStatus: string;
  completedAt: string;
};

type GroupFile = {
  fileId: string;
  guestId: string;
  type: string;
  originalName: string;
  mimeType: string;
  size: number;
  driveFileId: string;
  driveUrl: string;
  createdAt: string;
};

type DetailsResponse = {
  group: Group;
  guests: Guest[];
  files: GroupFile[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusLabel(status: string) {
  switch (status) {
    case "COMPLETED":
      return "Preenchido";
    case "PENDING":
      return "Pendente";
    case "APPROVED":
      return "Aprovado";
    case "REJECTED":
      return "Rejeitado";
    case "PENDING_REVIEW":
      return "Pendente";
    default:
      return status || "-";
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "COMPLETED":
    case "APPROVED":
      return "bg-emerald-400/15 text-emerald-200";

    case "REJECTED":
      return "bg-red-400/15 text-red-200";

    default:
      return "bg-amber-400/15 text-amber-200";
  }
}

export function RegistrationDetails({
  groupId,
}: {
  groupId: string;
}) {
  const [details, setDetails] =
    useState<DetailsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetails() {
      try {
        const response = await fetch(
          `/api/admin/inscricoes/${encodeURIComponent(
            groupId,
          )}/details`,
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ??
              "Não foi possível carregar os detalhes.",
          );
        }

        setDetails(result.details);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar os detalhes.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [groupId]);

  if (loading) {
    return (
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-white/60">
        Carregando detalhes...
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="mt-8 rounded-3xl border border-red-300/20 bg-red-400/10 p-6 text-red-100">
        {error ?? "Detalhes indisponíveis."}
      </div>
    );
  }

  const { group, guests, files } = details;
  <div className="flex flex-wrap gap-3">
    <Link
      href={`/admin/inscricoes/${encodeURIComponent(
        group.groupId,
      )}/editar`}
      className="rounded-2xl bg-pink-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-pink-400"
    >
      Editar inscrição
    </Link>
</div>
  return (
    <section className="mt-8 space-y-6">
    <div className="flex flex-wrap gap-3">
      <Link
        href={`/admin/inscricoes/${encodeURIComponent(
          group.groupId,
        )}/editar`}
        className="rounded-2xl bg-pink-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-pink-400"
      >
        Editar inscrição
      </Link>
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={UsersRound}
          label="Convidados"
          value={String(group.guestCount)}
        />

        <InfoCard
          icon={WalletCards}
          label="Valor previsto"
          value={formatCurrency(group.expectedAmount)}
        />

        <InfoCard
          icon={WalletCards}
          label="Valor aprovado"
          value={formatCurrency(group.approvedAmount)}
        />

        <InfoCard
          icon={FileText}
          label="PIX"
          value={getStatusLabel(group.pixStatus)}
        />
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <SectionTitle
          icon={UserRound}
          title="Dados do cadastro"
        />

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <DetailItem
            label="E-mail do cadastrante"
            value={group.email}
          />

          <DetailItem
            label="Data de criação"
            value={formatDate(group.createdAt)}
          />

          <DetailItem
            label="Nome do padrinho"
            value={group.sponsorName}
          />

          <DetailItem
            label="WhatsApp do padrinho"
            value={group.sponsorWhatsapp}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <SectionTitle
          icon={UsersRound}
          title="Convidados"
        />

        <div className="mt-6 space-y-4">
          {guests.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
            />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <SectionTitle
          icon={FileText}
          title="Comprovantes e arquivos"
        />

        {files.length === 0 ? (
          <p className="mt-5 text-sm text-white/50">
            Nenhum arquivo encontrado.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {files.map((file) => (
              <div
                key={file.fileId}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {file.originalName}
                  </p>

                  <p className="mt-1 text-xs text-white/50">
                    {file.type} · {file.mimeType}
                  </p>
                </div>

                {file.driveUrl && (
                  <a
                    href={file.driveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir arquivo
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <Icon className="h-5 w-5 text-pink-300" />
      <p className="mt-4 text-sm text-white/50">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: typeof UsersRound;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-cyan-300" />
      <h2 className="text-xl font-black">{title}</h2>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-white">
        {value || "-"}
      </p>
    </div>
  );
}

function GuestCard({
  guest,
}: {
  guest: Guest;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/10 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Convidado
          </p>

          <h3 className="mt-2 text-xl font-black">
            {guest.name}
          </h3>

          <p className="mt-1 text-sm text-white/50">
            {guest.whatsapp}
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
            guest.completionStatus,
          )}`}
        >
          {getStatusLabel(guest.completionStatus)}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <DetailItem
          label="Igreja"
          value={
            guest.otherChurch === "OTHER"
              ? guest.otherChurch
              : guest.church
          }
        />

        <DetailItem
          label="Perfil"
          value={guest.profile}
        />

        <DetailItem
          label="Questão alimentar"
          value={guest.foodRestriction}
        />

        <DetailItem
          label="Concluído em"
          value={formatDate(guest.completedAt)}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/admin/convidados/${encodeURIComponent(
            guest.id,
          )}`}
          className="rounded-xl border border-pink-300/20 bg-pink-400/10 px-3 py-2 text-xs font-semibold text-pink-100 transition hover:bg-pink-400/20"
        >
          Editar convidado
        </Link>

        {guest.personPhotoUrl && (
          <a
            href={guest.personPhotoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
          >
            Foto do convidado
          </a>
        )}

        {guest.rgPhotoUrl && (
          <a
            href={guest.rgPhotoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
          >
            Foto do RG
          </a>
        )}
      </div>
    </article>
  );
}