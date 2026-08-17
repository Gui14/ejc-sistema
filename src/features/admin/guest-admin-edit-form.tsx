"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  CheckCircle2,
  FileText,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { EjcButton } from "@/components/ui/ejc-button";
import { TextInput } from "@/components/forms/text-input";

type AdminGuest = {
  completionChurch: string;
  id: string;
  groupId?: string;
  sponsorId?: string;
  sponsorName?: string;
  name: string;
  phone: string;
  whatsapp?: string;

  profile: string;
  otherChurchName?: string;

  personPhotoUrl?: string;
  rgPhotoUrl?: string;

  foodRestriction?: string;
  completionStatus?: string;

  age?: string | number | null;
  birthDate?: string | null;
  sex?: string | null;
  education?: string | null;
  religion?: string | null;
  otherReligion?: string | null;
  church?: string | null;
  otherChurch?: string | null;
  email?: string | null;
  completionEmail?: string | null;
  completionPhone?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  otherCity?: string | null;
  cep?: string | null;
  completionFoodRestriction?: string | null;
  otherFoodRestriction?: string | null;
  specialMedication?: string | null;
  otherSpecialMedication?: string | null;
  completionOtherChurch?: string | null;
};

type Props = {
  guestId: string;
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

const educationOptions: Option[] = [
  {
    value: "ELEMENTARY",
    label: "Ensino fundamental",
  },
  {
    value: "HIGH_SCHOOL",
    label: "Ensino médio",
  },
  {
    value: "INCOMPLETE_HIGHER",
    label: "Superior incompleto",
  },
  {
    value: "COMPLETE_HIGHER",
    label: "Superior completo",
  },
];

const religionOptions: Option[] = [
  {
    value: "NONE",
    label: "Nenhuma",
  },
  {
    value: "CATHOLIC",
    label: "Católico",
  },
  {
    value: "UNBAPTIZED_CHRISTIAN",
    label: "Cristão não batizado",
  },
  {
    value: "EVANGELICAL",
    label: "Evangélico",
  },
  {
    value: "OTHER",
    label: "Outro",
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

const healthOptions: Option[] = [
  {
    value: "NONE",
    label: "Não",
  },
  {
    value: "OTHER",
    label: "Outro",
  },
];

function valueOrEmpty(
  value: string | number | null | undefined,
) {
  return value == null
    ? ""
    : String(value);
}

function normalizeDate(
  value: string | null | undefined,
) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function validateFile(
  file: File,
  allowedTypes: string[],
  label: string,
) {
  if (!allowedTypes.includes(file.type)) {
    return `${label} possui formato inválido.`;
  }

  if (file.size > 10 * 1024 * 1024) {
    return `${label} deve ter no máximo 10 MB.`;
  }

  return null;
}

export function GuestAdminEditForm({
  guestId,
}: Props) {
  const router = useRouter();

  const [guest, setGuest] =
    useState<AdminGuest | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [age, setAge] =
    useState("");

  const [birthDate, setBirthDate] =
    useState("");

  const [sex, setSex] =
    useState("");

  const [education, setEducation] =
    useState("");

  const [religion, setReligion] =
    useState("");

  const [otherReligion, setOtherReligion] =
    useState("");

  const [church, setChurch] =
    useState("");

  const [otherChurch, setOtherChurch] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [completionPhone, setCompletionPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [neighborhood, setNeighborhood] =
    useState("");

  const [city, setCity] =
    useState("");

  const [otherCity, setOtherCity] =
    useState("");

  const [cep, setCep] =
    useState("");

  const [
    completionFoodRestriction,
    setCompletionFoodRestriction,
  ] = useState("");

  const [
    otherFoodRestriction,
    setOtherFoodRestriction,
  ] = useState("");

  const [
    specialMedication,
    setSpecialMedication,
  ] = useState("");

  const [
    otherSpecialMedication,
    setOtherSpecialMedication,
  ] = useState("");

  const [
    personPhotoFile,
    setPersonPhotoFile,
  ] = useState<File | null>(null);

  const [
    rgPhotoFile,
    setRgPhotoFile,
  ] = useState<File | null>(null);

  useEffect(() => {
    async function loadGuest() {
      try {
        const response = await fetch(
          `/api/admin/convidados/${encodeURIComponent(
            guestId,
          )}`,
          {
            cache: "no-store",
          },
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ??
              "Não foi possível carregar o convidado.",
          );
        }

        const loadedGuest =
          result.guest as AdminGuest;

        setGuest(loadedGuest);

        setName(loadedGuest.name ?? "");

        setCompletionPhone(
          loadedGuest.completionPhone ??
            "",
        );

        setPhone(
          loadedGuest.phone ??
            "",
        );

        setAge(
          valueOrEmpty(
            loadedGuest.age,
          ),
        );

        setBirthDate(
          normalizeDate(
            loadedGuest.birthDate,
          ),
        );

        setSex(
          loadedGuest.sex ?? "",
        );

        setEducation(
          loadedGuest.education ?? "",
        );

        setReligion(
          loadedGuest.religion ?? "",
        );

        setOtherReligion(
          loadedGuest.otherReligion ?? "",
        );

       setChurch(
          loadedGuest.completionChurch ??
            "",
        );

        setOtherChurch(
          loadedGuest.completionOtherChurch ??
            "",
        );

        setEmail(
          loadedGuest.email ??
            loadedGuest.completionEmail ??
            "",
        );

        setCompletionPhone(
          loadedGuest.completionPhone ??
            loadedGuest.phone ??
            loadedGuest.whatsapp ??
            "",
        );

        setAddress(
          loadedGuest.address ?? "",
        );

        setNeighborhood(
          loadedGuest.neighborhood ?? "",
        );

        setCity(
          loadedGuest.city ?? "",
        );

        setOtherCity(
          loadedGuest.otherCity ?? "",
        );

        setCep(
          loadedGuest.cep ?? "",
        );

        setCompletionFoodRestriction(
          loadedGuest.completionFoodRestriction ??
            loadedGuest.foodRestriction ??
            "",
        );

        setOtherFoodRestriction(
          loadedGuest.otherFoodRestriction ??
            "",
        );

        setSpecialMedication(
          loadedGuest.specialMedication ??
            "",
        );

        setOtherSpecialMedication(
          loadedGuest.otherSpecialMedication ??
            "",
        );
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

  function validateForm() {
    if (!name.trim()) {
      return "Informe o nome do convidado.";
    }

    if (!phone.trim()) {
      return "Informe o WhatsApp do convidado.";
    }

    if (!age.trim()) {
      return "Informe a idade.";
    }

    const numericAge =
      Number(age);

    if (
      !Number.isInteger(numericAge) ||
      numericAge < 1 ||
      numericAge > 120
    ) {
      return "Informe uma idade válida.";
    }

    if (!birthDate) {
      return "Informe a data de nascimento.";
    }

    if (!sex) {
      return "Selecione o sexo.";
    }

    if (!education) {
      return "Selecione a escolaridade.";
    }

    if (!religion) {
      return "Selecione a religião.";
    }

    if (
      religion === "OTHER" &&
      !otherReligion.trim()
    ) {
      return "Informe a outra religião.";
    }

    if (!church) {
      return "Selecione a igreja.";
    }

    if (
      church === "OTHER" &&
      !otherChurch.trim()
    ) {
      return "Informe a outra igreja.";
    }

    if (!email.trim()) {
      return "Informe o e-mail.";
    }

    if (!completionPhone.trim()) {
      return "Informe o telefone da complementação.";
    }

    if (!address.trim()) {
      return "Informe o endereço.";
    }

    if (!neighborhood.trim()) {
      return "Informe o bairro.";
    }

    if (!city) {
      return "Selecione a cidade.";
    }

    if (
      city === "OTHER" &&
      !otherCity.trim()
    ) {
      return "Informe a outra cidade.";
    }

    if (!cep.trim()) {
      return "Informe o CEP.";
    }

    if (!completionFoodRestriction) {
      return "Selecione a restrição alimentar.";
    }

    if (
      completionFoodRestriction ===
        "OTHER" &&
      !otherFoodRestriction.trim()
    ) {
      return "Informe a restrição alimentar.";
    }

    if (!specialMedication) {
      return "Selecione a medicação especial.";
    }

    if (
      specialMedication === "OTHER" &&
      !otherSpecialMedication.trim()
    ) {
      return "Informe a medicação especial.";
    }

    return null;
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

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
            name: name.trim(),
            phone: phone.trim(),
            age: age.trim(),
            birthDate,
            sex,
            education,
            religion,
            otherReligion:
              otherReligion.trim(),
            church,
            otherChurch:
              otherChurch.trim(),
            email: email.trim(),
            completionPhone:
              completionPhone.trim(),
            address: address.trim(),
            neighborhood:
              neighborhood.trim(),
            city,
            otherCity:
              otherCity.trim(),
            cep: cep.trim(),
            completionFoodRestriction,
            otherFoodRestriction:
              otherFoodRestriction.trim(),
            specialMedication,
            otherSpecialMedication:
              otherSpecialMedication.trim(),
          }),
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível salvar o convidado.",
        );
      }

      setGuest(result.guest);

      setSuccess(
        "Dados do convidado atualizados.",
      );
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

  async function handleFileUpload() {
    if (
      !personPhotoFile &&
      !rgPhotoFile
    ) {
      setError(
        "Selecione a foto do convidado ou o RG.",
      );

      return;
    }

    const formData = new FormData();

    if (personPhotoFile) {
      formData.append(
        "personPhoto",
        personPhotoFile,
        personPhotoFile.name,
      );
    }

    if (rgPhotoFile) {
      formData.append(
        "rgPhoto",
        rgPhotoFile,
        rgPhotoFile.name,
      );
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

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

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível atualizar os arquivos.",
        );
      }

      setGuest(result.guest);
      setPersonPhotoFile(null);
      setRgPhotoFile(null);

      setSuccess(
        "Arquivos atualizados com sucesso.",
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível atualizar os arquivos.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    const confirmed =
      window.confirm(
        "Tem certeza que deseja excluir este convidado?",
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/admin/convidados/${encodeURIComponent(
          guestId,
        )}`,
        {
          method: "DELETE",
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Não foi possível excluir o convidado.",
        );
      }

      router.push("/admin/convidados");
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir o convidado.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-white/60">
        Carregando convidado...
      </div>
    );
  }

  if (error && !guest) {
    return (
      <div className="mt-8 rounded-3xl border border-red-300/20 bg-red-400/10 p-6 text-red-100">
        {error}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="mt-8 space-y-6"
    >
      {success && (
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Cadastro inicial
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Dados básicos
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Nome completo"
            value={name}
            onChange={setName}
          />

          <Field
            label="WhatsApp"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="(73) 99999-9999"
          />

          <ReadOnlyField
            label="Padrinho"
            value={
              guest?.sponsorName ??
              guest?.sponsorId ??
              "Não informado"
            }
          />

          <ReadOnlyField
            label="Grupo"
            value={
              guest?.groupId ??
              "Não informado"
            }
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-200">
            Dados pessoais
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Complementação
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Idade"
            type="number"
            value={age}
            onChange={setAge}
            min="1"
            max="120"
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

          <SelectField
            label="Escolaridade"
            value={education}
            onChange={setEducation}
            options={educationOptions}
          />

          <SelectField
            label="Religião"
            value={religion}
            onChange={setReligion}
            options={religionOptions}
          />

          {religion === "OTHER" && (
            <Field
              label="Outra religião"
              value={otherReligion}
              onChange={setOtherReligion}
            />
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-200">
            Igreja e contato
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Informações de contato
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="A qual igreja pertence?"
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

          <Field
            label="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
          />

          <Field
            label="Telefone da complementação"
            type="tel"
            value={completionPhone}
            onChange={setCompletionPhone}
          />

          <Field
            label="Endereço"
            value={address}
            onChange={setAddress}
          />

          <Field
            label="Bairro"
            value={neighborhood}
            onChange={setNeighborhood}
          />

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

          <Field
            label="CEP"
            value={cep}
            onChange={setCep}
            placeholder="00000-000"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-200">
            Saúde
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Informações de saúde
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Restrição alimentar"
            value={
              completionFoodRestriction
            }
            onChange={
              setCompletionFoodRestriction
            }
            options={healthOptions}
          />

          {completionFoodRestriction ===
            "OTHER" && (
            <Field
              label="Outra restrição alimentar"
              value={
                otherFoodRestriction
              }
              onChange={
                setOtherFoodRestriction
              }
            />
          )}

          <SelectField
            label="Medicação especial"
            value={specialMedication}
            onChange={
              setSpecialMedication
            }
            options={healthOptions}
          />

          {specialMedication ===
            "OTHER" && (
            <Field
              label="Outra medicação especial"
              value={
                otherSpecialMedication
              }
              onChange={
                setOtherSpecialMedication
              }
            />
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-200">
            Arquivos
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Foto e RG
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FileInput
            label="Nova foto do convidado"
            accept=".png,.jpg,.jpeg"
            file={personPhotoFile}
            onChange={(file) => {
              if (!file) {
                setPersonPhotoFile(
                  null,
                );
                return;
              }

              const validationError =
                validateFile(
                  file,
                  [
                    "image/png",
                    "image/jpeg",
                  ],
                  "A foto do convidado",
                );

              if (validationError) {
                setError(
                  validationError,
                );
                return;
              }

              setError(null);
              setPersonPhotoFile(file);
            }}
          />

          <FileInput
            label="Novo RG"
            accept=".png,.jpg,.jpeg,.pdf"
            file={rgPhotoFile}
            onChange={(file) => {
              if (!file) {
                setRgPhotoFile(null);
                return;
              }

              const validationError =
                validateFile(
                  file,
                  [
                    "image/png",
                    "image/jpeg",
                    "application/pdf",
                  ],
                  "O RG",
                );

              if (validationError) {
                setError(
                  validationError,
                );
                return;
              }

              setError(null);
              setRgPhotoFile(file);
            }}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <EjcButton
            type="button"
            onClick={handleFileUpload}
            disabled={uploading}
          >
            <UploadCloud className="mr-2 h-4 w-4" />

            {uploading
              ? "Enviando arquivos..."
              : "Atualizar arquivos"}
          </EjcButton>

          {guest?.personPhotoUrl && (
            <a
              href={guest.personPhotoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
            >
              Ver foto atual
            </a>
          )}

          {guest?.rgPhotoUrl && (
            <a
              href={guest.rgPhotoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
            >
              Ver RG atual
            </a>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <EjcButton
          type="submit"
          disabled={saving}
        >
          <Save className="mr-2 h-4 w-4" />

          {saving
            ? "Salvando..."
            : "Salvar alterações"}
        </EjcButton>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center justify-center rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          <Trash2 className="mr-2 h-4 w-4" />

          {deleting
            ? "Excluindo..."
            : "Excluir convidado"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/90">
        {label}
      </span>

      <TextInput
        type={type}
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
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
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-pink-300/50"
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

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-white/90">
        {label}
      </span>

      <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white/60">
        {value || "Não informado"}
      </div>
    </div>
  );
}

function FileInput({
  label,
  accept,
  file,
  onChange,
}: {
  label: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/90">
        {label}
      </span>

      <span className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-pink-200/40 bg-white/5 p-4 transition hover:bg-white/10">
        <FileText className="h-6 w-6 text-pink-200" />

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {file?.name ??
              "Selecionar arquivo"}
          </span>

          <span className="mt-1 block text-xs text-white/50">
            Máximo de 10 MB
          </span>
        </span>

        <input
          type="file"
          className="sr-only"
          accept={accept}
          onChange={(event) =>
            onChange(
              event.target.files?.[0] ??
                null,
            )
          }
        />
      </span>
    </label>
  );
}