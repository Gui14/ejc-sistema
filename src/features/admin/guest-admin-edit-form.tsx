"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { TextInput } from "@/components/forms/text-input";
import { SelectInput } from "@/components/forms/select-input";
import { EjcButton } from "@/components/ui/ejc-button";

type GuestData = {
  id: string;
  church: string;
  otherChurch: string;
  profile: string;
  name: string;
  whatsapp: string;
  foodRestriction: string;
  completionStatus: string;
  personPhotoUrl: string;
  rgPhotoUrl: string;
};




const profileOptions = [
  {
    value: "TEO_MEMBER_OR_ATTENDEE",
    label: "Membro ou Congregado da TEO",
  },
  {
    value: "NON_EVANGELICAL",
    label: "Não Evangélico",
  },
  {
    value: "OTHER_EVANGELICAL_CHURCH",
    label: "Membro ou Congregado de outra igreja Evangélica",
  },
];

export function GuestAdminEditForm({
  guestId,
}: {
  guestId: string;
}) {
  const router = useRouter();

  const [guest, setGuest] = useState<GuestData | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] =
  useState(false);
  const [personPhotoFile, setPersonPhotoFile] =
  useState<File | null>(null);

const [rgPhotoFile, setRgPhotoFile] =
  useState<File | null>(null);

const [uploadingFiles, setUploadingFiles] =
  useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadGuest() {
      try {
        const response = await fetch(
          `/api/admin/convidados/${encodeURIComponent(
            guestId,
          )}`,
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ??
              "Não foi possível carregar o convidado.",
          );
        }

        setGuest(result.guest);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar o convidado.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadGuest();
  }, [guestId]);

  function updateField(
    field: keyof GuestData,
    value: string,
  ) {
    setGuest((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );
  }

  async function handleDelete() {
  setDeleting(true);
  setError(null);

  try {
    const response = await fetch(
      `/api/admin/convidados/${encodeURIComponent(
        guestId,
      )}`,
      {
        method: "DELETE",
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ??
          "Não foi possível excluir o convidado.",
      );
    }

    window.location.href =
      "/admin/inscricoes";
  } catch (deleteError) {
    setError(
      deleteError instanceof Error
        ? deleteError.message
        : "Erro ao excluir convidado.",
    );
  } finally {
    setDeleting(false);
    setShowDeleteModal(false);
  }
}
  async function handleFileUpload() {
  if (!personPhotoFile && !rgPhotoFile) {
    setError("Selecione pelo menos um arquivo.");
    return;
  }

  const formData = new FormData();

  if (personPhotoFile) {
    formData.append(
      "personPhoto",
      personPhotoFile,
    );
  }

  if (rgPhotoFile) {
    formData.append("rgPhoto", rgPhotoFile);
  }

  setUploadingFiles(true);
  setError(null);
  setSuccess(false);

  try {
    const response = await fetch(
      `/api/admin/convidados/${encodeURIComponent(
        guestId,
      )}`,
      {
        method: "POST",
        body: formData,
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ??
          "Não foi possível atualizar os arquivos.",
      );
    }

    setGuest(result.guest);
    setPersonPhotoFile(null);
    setRgPhotoFile(null);
    setSuccess(true);
  } catch (uploadError) {
    setError(
      uploadError instanceof Error
        ? uploadError.message
        : "Não foi possível atualizar os arquivos.",
    );
  } finally {
    setUploadingFiles(false);
  }
}

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!guest) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        `/api/admin/convidados/${encodeURIComponent(
          guestId,
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            church: guest.church,
            otherChurch: guest.otherChurch,
            profile: guest.profile,
            name: guest.name,
            whatsapp: guest.whatsapp,
            foodRestriction: guest.foodRestriction,
            completionStatus:
              guest.completionStatus,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível salvar o convidado.",
        );
      }

      setGuest(result.guest);
      setSuccess(true);

      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar o convidado.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-white/60">
        Carregando convidado...
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="mt-8 rounded-3xl border border-red-300/20 bg-red-400/10 p-6 text-red-100">
        {error ?? "Convidado não encontrado."}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6"
    >
      <button
  type="button"
  onClick={() => setShowDeleteModal(true)}
  className="rounded-xl border border-red-400/30 px-5 py-3 font-bold text-red-300"
>
  Excluir convidado
</button>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-black">
          Dados iniciais
        </h2>

        <div className="mt-5 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-white/80">
                Igreja
              </label>

              <SelectInput
                value={guest.church}
                onChange={(event) =>
                  updateField(
                    "church",
                    event.target.value,
                  )
                }
                className="mt-2"
              >
                <option value="TEOSOPOLIS">
                  Igreja Batista Teosópolis
                </option>

                <option value="OTHER">
                  Outra igreja
                </option>
              </SelectInput>
            </div>

            <div>
              <label className="text-sm font-semibold text-white/80">
                Perfil
              </label>

              <SelectInput
                value={guest.profile}
                onChange={(event) =>
                  updateField(
                    "profile",
                    event.target.value,
                  )
                }
                className="mt-2"
              >
                {profileOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </div>
          </div>

          {guest.church === "OTHER" && (
            <div>
              <label className="text-sm font-semibold text-white/80">
                Nome da igreja
              </label>

              <TextInput
                value={guest.otherChurch}
                onChange={(event) =>
                  updateField(
                    "otherChurch",
                    event.target.value,
                  )
                }
                className="mt-2"
              />
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-white/80">
                Nome completo
              </label>

              <TextInput
                value={guest.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value,
                  )
                }
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-white/80">
                WhatsApp
              </label>

              <TextInput
                value={guest.whatsapp}
                onChange={(event) =>
                  updateField(
                    "whatsapp",
                    event.target.value,
                  )
                }
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-black">
          Dados complementares
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label className="text-sm font-semibold text-white/80">
              Questão alimentar
            </label>

            <TextInput
              value={guest.foodRestriction}
              onChange={(event) =>
                updateField(
                  "foodRestriction",
                  event.target.value,
                )
              }
              placeholder="Nenhuma, intolerância..."
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white/80">
              Status
            </label>

            <SelectInput
              value={guest.completionStatus}
              onChange={(event) =>
                updateField(
                  "completionStatus",
                  event.target.value,
                )
              }
              className="mt-2"
            >
              <option value="PENDING">
                Pendente
              </option>

              <option value="COMPLETED">
                Preenchido
              </option>
            </SelectInput>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-black">
          Arquivos atuais
        </h2>

        <div className="mt-5 flex flex-wrap gap-3">
          {guest.personPhotoUrl && (
            <a
              href={guest.personPhotoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white"
            >
              Abrir foto do convidado
            </a>
          )}

          {guest.rgPhotoUrl && (
            <a
              href={guest.rgPhotoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white"
            >
              Abrir RG
            </a>
          )}

          {!guest.personPhotoUrl &&
            !guest.rgPhotoUrl && (
              <p className="text-sm text-white/50">
                Nenhum arquivo enviado.
              </p>
            )}
        </div>
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-black">
                Substituir arquivos
            </h2>

            <p className="mt-2 text-sm text-white/50">
                Arquivos antigos serão enviados para a lixeira do Google Drive.
            </p>

            <div className="mt-5 space-y-5">
                <div>
                <label className="text-sm font-semibold text-white/80">
                    Nova foto do convidado
                </label>

                <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={(event) =>
                    setPersonPhotoFile(
                        event.target.files?.[0] ?? null,
                    )
                    }
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                />
                </div>

                <div>
                <label className="text-sm font-semibold text-white/80">
                    Novo RG
                </label>

                <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={(event) =>
                    setRgPhotoFile(
                        event.target.files?.[0] ?? null,
                    )
                    }
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                />
                </div>
            </div>

            <EjcButton
                type="button"
                className="mt-5 w-full"
                onClick={handleFileUpload}
                disabled={uploadingFiles}
            >
                {uploadingFiles
                ? "Enviando arquivos..."
                : "Atualizar arquivos"}
            </EjcButton>
            </section>
      </section>
                  {showDeleteModal && (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6">
          <h2 className="text-xl font-black">
            Excluir convidado?
          </h2>

          <p className="mt-3 text-sm text-white/60">
            O cadastro será removido das listagens e os arquivos
            serão enviados para a lixeira do Google Drive.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {deleting
                ? "Excluindo..."
                : "Sim, excluir"}
            </button>
          </div>
        </div>
      </div>
    )}
      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          Convidado atualizado com sucesso.
        </div>
      )}
      

      <EjcButton
        type="submit"
        className="w-full"
        disabled={saving}
      >
        {saving ? "Salvando..." : "Salvar alterações"}
      </EjcButton>
    </form>
    
  );
}