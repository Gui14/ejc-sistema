"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  WalletCards,
} from "lucide-react";

type AdminSummary = {
  totalGroups: number;
  totalGuests: number;
  completedGuests: number;
  pendingGuests: number;
  expectedAmount: number;
  approvedAmount: number;
  pendingPix: number;
  conversionRate: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function AdminDashboard() {
  const [summary, setSummary] = useState<AdminSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        const response = await fetch("/api/admin/summary");

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ?? "Não foi possível carregar o resumo.",
          );
        }

        setSummary(result.summary);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar o resumo.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-white/60">
        Carregando indicadores...
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="mt-8 rounded-3xl border border-red-300/20 bg-red-400/10 p-6 text-red-100">
        {error ?? "Resumo indisponível."}
      </div>
    );
  }

  const cards = [
    {
      label: "Inscrições",
      value: String(summary.totalGroups),
      icon: ClipboardList,
      color: "text-cyan-300",
    },
    {
      label: "Convidados",
      value: String(summary.totalGuests),
      icon: ClipboardList,
      color: "text-pink-300",
    },
    {
      label: "Convidados preenchidos",
      value: String(summary.completedGuests),
      icon: CheckCircle2,
      color: "text-emerald-300",
    },
    {
      label: "Pendentes",
      value: String(summary.pendingGuests),
      icon: Clock3,
      color: "text-amber-300",
    },
    {
      label: "Valor previsto",
      value: formatCurrency(summary.expectedAmount),
      icon: WalletCards,
      color: "text-violet-300",
    },
    {
      label: "PIX aprovado",
      value: formatCurrency(summary.approvedAmount),
      icon: WalletCards,
      color: "text-emerald-300",
    },
    {
      label: "Comprovantes pendentes",
      value: String(summary.pendingPix),
      icon: Clock3,
      color: "text-orange-300",
    },
    {
      label: "Taxa de conversão",
      value: `${summary.conversionRate.toFixed(1)}%`,
      icon: CheckCircle2,
      color: "text-cyan-300",
    },
  ];

  return (
    <section className="mt-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-white/50">
                  {card.label}
                </p>

                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>

              <p className="mt-4 text-3xl font-black">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}