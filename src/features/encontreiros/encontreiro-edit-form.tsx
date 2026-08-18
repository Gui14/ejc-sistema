"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Save,
  UploadCloud,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { EjcButton } from "@/components/ui/ejc-button";
import { TextInput } from "@/components/forms/text-input";

type PixStatus = "PENDING" | "APPROVED" | "REJECTED";

type Encontreiro = {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  birthDate: string;
  sex: string;
  church: string;
  otherChurch: string;
  city: string;
  otherCity: string;
  observations: string;
  pixReceiptUrl: string;
  pixStatus: PixStatus | string;
  adminObservation: string;
};

type EncontreiroEditFormProps = {
  encontreiro: Encontreiro;
  onSaved?: (encontreiro: Encontreiro) => void;
  onCancel?: () => void;
};

type Option = {
  value: string;
  label: string;
};

const sexOptions: Option[] = [
  {
    value: "MALE",
    label: "Masculino",
  },
  {
    value: "FEMALE",
    label: "Feminino",
  },
];

const churchOptions: Option[] = [
  {
    value: "NONE",
    label: "Nenhuma",
  },
  {
    value: "TEOSPOLIS",
    label: "Igreja Batista Teosópolis",
  },
  {
    value: "OTHER",
    label: "Outra",
  },
];

const cityOptions: Option[] = [
  {
    value: "ITABUNA",
    label: "Itabuna",
  },
  {
    value: "OTHER",
    label: "Outra",
  },
];

const pixStatusOptions: Option[] = [
  {
    value: "PENDING",
    label: "Pendente",
  },
  {
    value: "APPROVED",
    label: "Aprovado",
  },
  {
    value: "REJECTED",
    label: "Rejeitado",
  },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedPixTypes = [
  "image/png",
  "image/jpeg",
  "application/pdf",
];

function normalizeDate(value: string) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function normalizePixStatus(value: string): PixStatus {
  if (
    value === "APPROVED" ||
    value === "REJECTED"
  ) {
    return value;
  }

  return "PENDING";
}

export function EncontreiroEditForm({
  encontreiro,
  onSaved,
  onCancel,
}: EncontreiroEditFormProps) {
  const [name, setName] = useState(
    encontreiro.name ?? "",
  );
  const [whatsapp, setWhatsapp] = useState(
    encontreiro.whatsapp ?? "",
  );
  const [email, setEmail] = useState(
    encontreiro.email ?? "",
  );
  const [birthDate, setBirthDate] = useState(
    normalizeDate(encontreiro.birthDate),
  );
  const [sex, setSex] = useState(
    encontreiro.sex ?? "",
  );
  const [church, setChurch] = useState(
    encontreiro.church ?? "",
  );
  const [otherChurch, setOtherChurch] = useState(
    encontreiro.otherChurch ?? "",
  );
  const [city, setCity] = useState(
    encontreiro.city ?? "",
  );
  const [otherCity, setOtherCity] = useState(
    encontreiro.otherCity ?? "",
  );
  const [observations, setObservations] = useState(
    encontreiro.observations ?? "",
  );
  const [pixStatus, setPixStatus] = useState<PixStatus>(
    normalizePixStatus(encontreiro.pixStatus),
  );
  const [adminObservation, setAdminObservation] = useState(
    encontreiro.adminObservation ?? "",
  );
  const [pixReceipt, setPixReceipt] = useState<File | null>(
    null,
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setName(encontreiro.name ?? "");
    setWhatsapp(encontreiro.whatsapp ?? "");
    setEmail(encontreiro.email ?? "");
    setBirthDate(normalizeDate(encontreiro.birthDate));
    setSex(encontreiro.sex ?? "");
    setChurch(encontreiro.church ?? "");
    setOtherChurch(encontreiro.otherChurch ?? "");
    setCity(encontreiro.city ?? "");
    setOtherCity(encontreiro.otherCity ?? "");
    setObservations(encontreiro.observations ?? "");
    setPixStatus(normalizePixStatus(encontreiro.pixStatus));
    setAdminObservation(encontreiro.adminObservation ?? "");
    setPixReceipt(null);
    setError(null);
    setSuccess(false);
  }, [encontreiro]);

  function validateForm() {
    if (!name.trim()) {
      return "Informe o nome completo.";
    }

    if (!whatsapp.trim()) {
      return "Informe o WhatsApp.";
    }

    if (!email.trim()) {
      return "Informe o e-mail.";
    }

    if (!birthDate) {
      return "Informe a data de nascimento.";
    }

    if (!sex) {
      return "Selecione o sexo.";
    }

    if (!church) {
      return "Selecione a igreja.";
    }

    if (
      church === "OTHER" &&
      !otherChurch.trim()
    ) {
      return "Informe o nome da outra igreja.";
    }

    if (!city) {
      return "Selecione a cidade.";
    }

    if (
      city === "OTHER" &&
      !otherCity.trim()
    ) {
      return "Informe o nome da outra cidade.";
    }

    if (pixReceipt) {
      if (!allowedPixTypes.includes(pixReceipt.type)) {
        return "O comprovante deve ser PNG, JPG ou PDF.";
      }

      if (pixReceipt.size > MAX_FILE_SIZE) {
        return "O comprovante deve ter no máximo 10 MB.";
      }
    }

    if (
      pixStatus === "REJECTED" &&
      !adminObservation.trim()
    ) {
      return "Informe o motivo da rejeição do PIX.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSuccess(false);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();

    formData.append("name", name.trim());
    formData.append("whatsapp", whatsapp.trim());
    formData.append("email", email.trim());
    formData.append("birthDate", birthDate);
    formData.append("sex", sex);
    formData.append("church", church);
    formData.append("otherChurch", otherChurch.trim());
    formData.append("city", city);
    formData.append("otherCity", otherCity.trim());
    formData.append("observations", observations.trim());
    formData.append("pixStatus", pixStatus);
    formData.append(
      "adminObservation",
      adminObservation.trim(),
    );

    if (pixReceipt) {
      formData.append(
        "pixReceipt",
        pixReceipt,
        pixReceipt.name,
      );
    }

    try {
      const response = await fetch(
        `/api/admin/encontreiros/${encodeURIComponent(
          encontreiro.id,
        )}`,
        {
          method: "PATCH",
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível atualizar o cadastro.",
        );
      }

      setSuccess(true);

      const router = useRouter();
      if (result.encontreiro) {
        onSaved?.(result.encontreiro);
      }

      window.setTimeout(() => {
        router.push("/admin/encontreiros");
        router.refresh();
      }, 700);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível atualizar o cadastro.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Cadastro de encontreiro
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Editar cadastro
          </h2>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Fechar formulário"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
          <span>Cadastro atualizado com sucesso.</span>
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-xl font-black text-white">
          Dados pessoais
        </h3>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field
            label="Nome completo"
            value={name}
            onChange={setName}
          />

          <Field
            label="WhatsApp"
            type="tel"
            value={whatsapp}
            onChange={setWhatsapp}
          />

          <Field
            label="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
          />

          <Field
            label="Data de nascimento"
            type="date"
            value={birthDate}
            onChange={setBirthDate}
          />

          <SelectField
            label="Sexo"
            value={sex}
            onChange={setSex}
            options={sexOptions}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-xl font-black text-white">
          Igreja e cidade
        </h3>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Igreja"
            value={church}
            onChange={setChurch}
            options={churchOptions}
          />

          {church === "OTHER" && (
            <Field
              label="Outra igreja"
              value={otherChurch}
              onChange={setOtherChurch}
            />
          )}

          <SelectField
            label="Cidade"
            value={city}
            onChange={setCity}
            options={cityOptions}
          />

          {city === "OTHER" && (
            <Field
              label="Outra cidade"
              value={otherCity}
              onChange={setOtherCity}
            />
          )}

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-white/90">
              Observações do cadastro
            </span>

            <textarea
              value={observations}
              onChange={(event) =>
                setObservations(event.target.value)
              }
              rows={5}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-300/50"
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-white">
              Comprovante PIX
            </h3>

            <p className="mt-2 text-sm text-white/50">
              O administrador pode substituir o arquivo e atualizar a análise.
            </p>
          </div>

          {encontreiro.pixReceiptUrl && (
            <a
              href={encontreiro.pixReceiptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/15 px-3 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/25"
            >
              <ExternalLink className="h-4 w-4" />
              Ver comprovante atual
            </a>
          )}
        </div>

        <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-pink-200/40 bg-white/5 p-4 transition hover:bg-white/10">
          <UploadCloud className="h-6 w-6 shrink-0 text-pink-200" />

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">
              {pixReceipt?.name ??
                "Substituir comprovante PIX"}
            </span>

            <span className="mt-1 block text-xs text-white/50">
              PNG, JPG ou PDF — máximo de 10 MB
            </span>
          </span>

          <FileText className="h-5 w-5 shrink-0 text-white/40" />

          <input
            type="file"
            className="sr-only"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={(event) =>
              setPixReceipt(
                event.target.files?.[0] ?? null,
              )
            }
          />
        </label>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-xl font-black text-white">
          Análise do PIX
        </h3>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Status do PIX"
            value={pixStatus}
            onChange={(value) =>
              setPixStatus(value as PixStatus)
            }
            options={pixStatusOptions}
          />

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-white/90">
              Observação do administrador
            </span>

            <textarea
              value={adminObservation}
              onChange={(event) =>
                setAdminObservation(event.target.value)
              }
              rows={4}
              placeholder="Informe o motivo da rejeição ou alguma observação."
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-pink-300/50"
            />
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/5 p-4 text-xs leading-5 text-amber-100/80">
          Ao selecionar “Aprovado”, o comprovante será considerado validado. Ao selecionar “Rejeitado”, informe o motivo na observação.
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
        )}

        <EjcButton
          type="submit"
          disabled={saving}
          className="sm:min-w-48"
        >
          {saving ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              <Save className="h-4 w-4" />
              Salvar alterações
            </span>
          )}
        </EjcButton>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/90">
        {label}
      </span>

      <TextInput
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/90">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-300/50"
      >
        <option value="">
          Selecione uma opção
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}