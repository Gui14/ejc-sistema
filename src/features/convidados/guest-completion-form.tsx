"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, UploadCloud } from "lucide-react";

import { EjcButton } from "@/components/ui/ejc-button";
import { TextInput } from "@/components/forms/text-input";

type GuestCompletionFormProps = {
  token: string;
};

type GuestResponse = {
  id: string;
  name: string;
  completionStatus: "PENDING" | "COMPLETED";
  foodRestriction: string | null;
};

export function GuestCompletionForm({
  token,
}: GuestCompletionFormProps) {
  const [guest, setGuest] = useState<GuestResponse | null>(
    null,
  );
  const [foodRestriction, setFoodRestriction] = useState("");
  const [personPhoto, setPersonPhoto] = useState<File | null>(
    null,
  );
  const [rgPhoto, setRgPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadGuest() {
      try {
        const response = await fetch(
          `/api/convidados/${token}`,
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ?? "Não foi possível carregar o cadastro.",
          );
        }

        setGuest(result.guest);
        setFoodRestriction(
          result.guest.foodRestriction ?? "",
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar o cadastro.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadGuest();
  }, [token]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);

    if (!foodRestriction.trim()) {
      setError("Informe a questão alimentar.");
      return;
    }

    if (!personPhoto) {
      setError("Envie a foto do convidado.");
      return;
    }

    if (!rgPhoto) {
      setError("Envie a foto do RG.");
      return;
    }

    const formData = new FormData();

    formData.append(
      "foodRestriction",
      foodRestriction.trim(),
    );
    formData.append("personPhoto", personPhoto);
    formData.append("rgPhoto", rgPhoto);

    try {
      setSubmitting(true);

      const response = await fetch(
        `/api/convidados/${token}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Não foi possível salvar os dados.",
        );
      }

      setGuest(result.guest);
      setSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível salvar os dados.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/15 bg-white/10 p-8 text-center text-white/70">
        Carregando seu cadastro...
      </div>
    );
  }

  if (error && !guest) {
    return (
      <div className="rounded-3xl border border-red-300/20 bg-red-400/10 p-8 text-center">
        <p className="text-red-100">{error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-300" />

        <h2 className="mt-5 text-2xl font-black">
          Cadastro concluído!
        </h2>

        <p className="mt-3 text-white/70">
          Suas informações foram recebidas pela equipe do EJC.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <section className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
          Seu cadastro
        </p>

        <h2 className="mt-3 text-3xl font-black">
          {guest?.name}
        </h2>

        <p className="mt-3 text-sm text-white/60">
          O nome acima foi informado no cadastro inicial e não pode
          ser alterado nesta tela.
        </p>
      </section>

      <section className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8">
        <label className="block text-sm font-semibold text-white/90">
          Questão alimentar
          <span className="ml-1 text-pink-300">*</span>
        </label>

        <TextInput
          value={foodRestriction}
          onChange={(event) =>
            setFoodRestriction(event.target.value)
          }
          placeholder="Ex.: Nenhuma, intolerância à lactose..."
          className="mt-2"
        />
      </section>

      <section className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-200">
            Documentos
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Envie suas fotos
          </h2>

          <p className="mt-2 text-sm text-white/60">
            Cada arquivo deve ter no máximo 10 MB.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/90">
              Foto do convidado
              <span className="ml-1 text-pink-300">*</span>
            </span>

            <span className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-pink-200/40 bg-white/5 p-4 transition hover:bg-white/10">
              <UploadCloud className="h-6 w-6 text-pink-200" />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {personPhoto?.name ?? "Selecionar foto"}
                </span>

                <span className="mt-1 block text-xs text-white/50">
                  PNG ou JPG
                </span>
              </span>

              <input
                type="file"
                className="sr-only"
                accept=".png,.jpg,.jpeg"
                onChange={(event) =>
                  setPersonPhoto(
                    event.target.files?.[0] ?? null,
                  )
                }
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/90">
              Foto do RG
              <span className="ml-1 text-pink-300">*</span>
            </span>

            <span className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-pink-200/40 bg-white/5 p-4 transition hover:bg-white/10">
              <FileText className="h-6 w-6 text-pink-200" />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {rgPhoto?.name ?? "Selecionar RG"}
                </span>

                <span className="mt-1 block text-xs text-white/50">
                  PNG, JPG ou PDF
                </span>
              </span>

              <input
                type="file"
                className="sr-only"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={(event) =>
                  setRgPhoto(
                    event.target.files?.[0] ?? null,
                  )
                }
              />
            </span>
          </label>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      <EjcButton
        type="submit"
        className="w-full"
        disabled={submitting}
      >
        {submitting
          ? "Enviando..."
          : "Concluir cadastro"}
      </EjcButton>
    </form>
  );
}