"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { EjcButton } from "@/components/ui/ejc-button";
import { SelectInput } from "@/components/forms/select-input";
import { TextInput } from "@/components/forms/text-input";

type GuestEdit = {
  id: string;
  church: string;
  otherChurch: string;
  profile: string;
  name: string;
  whatsapp: string;
  adoptiveParentsName: string;
  adoptiveParentsWhatsapp: string;
};

type EditDetails = {
  group: {
    email: string;
    sponsorName: string;
    sponsorWhatsapp: string;
  };
  guests: GuestEdit[];
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

export function RegistrationEditForm({
  groupId,
}: {
  groupId: string;
}) {
  const router = useRouter();

  const [details, setDetails] =
    useState<EditDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      try {
        const response = await fetch(
          `/api/admin/inscricoes/${encodeURIComponent(
            groupId,
          )}/edit`,
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ??
              "Não foi possível carregar a inscrição.",
          );
        }

        setDetails({
          group: {
            email: result.details.group.email,
            sponsorName:
              result.details.group.sponsorName,
            sponsorWhatsapp:
              result.details.group.sponsorWhatsapp,
          },
          guests: result.details.guests,
        });
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar a inscrição.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [groupId]);

  function updateGroupField(
    field: keyof EditDetails["group"],
    value: string,
  ) {
    setDetails((current) =>
      current
        ? {
            ...current,
            group: {
              ...current.group,
              [field]: value,
            },
          }
        : current,
    );
  }

  function updateGuestField(
    index: number,
    field: keyof GuestEdit,
    value: string,
  ) {
    setDetails((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        guests: current.guests.map((guest, guestIndex) =>
          guestIndex === index
            ? {
                ...guest,
                [field]: value,
              }
            : guest,
        ),
      };
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!details) {
      return;
    }

    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/inscricoes/${encodeURIComponent(
          groupId,
        )}/edit`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: details.group.email,
            sponsorName: details.group.sponsorName,
            sponsorWhatsapp:
              details.group.sponsorWhatsapp,
            guests: details.guests,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível salvar as alterações.",
        );
      }

      setSuccess(true);

      setTimeout(() => {
        router.push(`/admin/inscricoes/${groupId}`);
        router.refresh();
      }, 800);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar as alterações.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-white/60">
        Carregando edição...
      </div>
    );
  }

  if (!details) {
    return (
      <div className="mt-8 rounded-3xl border border-red-300/20 bg-red-400/10 p-6 text-red-100">
        {error ?? "Inscrição indisponível."}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6"
    >
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-black">
          Dados do cadastro
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label className="text-sm font-semibold text-white/80">
              E-mail
            </label>

            <TextInput
              type="email"
              value={details.group.email}
              onChange={(event) =>
                updateGroupField(
                  "email",
                  event.target.value,
                )
              }
              className="mt-2"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-white/80">
                Nome do Pai adotivo
              </label>

              <TextInput
                value={details.group.sponsorName}
                onChange={(event) =>
                  updateGroupField(
                    "sponsorName",
                    event.target.value,
                  )
                }
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-white/80">
                WhatsApp do Pai adotivo
              </label>

              <TextInput
                value={details.group.sponsorWhatsapp}
                onChange={(event) =>
                  updateGroupField(
                    "sponsorWhatsapp",
                    event.target.value,
                  )
                }
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </section>

      {details.guests.map((guest, index) => (
        <section
          key={guest.id}
          className="rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Convidado {index + 1}
          </p>

          <div className="mt-5 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-white/80">
                  Igreja
                </label>

                <SelectInput
                  value={guest.church}
                  onChange={(event) =>
                    updateGuestField(
                      index,
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
                    updateGuestField(
                      index,
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
                    updateGuestField(
                      index,
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
                    updateGuestField(
                      index,
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
                    updateGuestField(
                      index,
                      "whatsapp",
                      event.target.value,
                    )
                  }
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-white/80">
                  Nome dos pais adotivos
                </label>

                <TextInput
                  value={guest.adoptiveParentsName}
                  onChange={(event) =>
                    updateGuestField(
                      index,
                      "adoptiveParentsName",
                      event.target.value,
                    )
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-white/80">
                  WhatsApp dos pais adotivos
                </label>

                <TextInput
                  value={guest.adoptiveParentsWhatsapp}
                  onChange={(event) =>
                    updateGuestField(
                      index,
                      "adoptiveParentsWhatsapp",
                      event.target.value,
                    )
                  }
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </section>
      ))}

      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          Alterações salvas com sucesso.
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