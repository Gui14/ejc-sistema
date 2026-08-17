"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  CheckCircle2,
  FileText,
  UploadCloud,
} from "lucide-react";

import { EjcButton } from "@/components/ui/ejc-button";
import { TextInput } from "@/components/forms/text-input";

type GuestCompletionFormProps = {
  token: string;
};

type GuestResponse = {
  id: string;
  name: string;
  completionStatus: string;
  foodRestriction: string | null;

  age: string | null;
  birthDate: string | null;
  sex: string | null;
  education: string | null;
  religion: string | null;
  otherReligion: string | null;
  church: string | null;
  otherChurch: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  otherCity: string | null;
  cep: string | null;
  completionFoodRestriction: string | null;
  otherFoodRestriction: string | null;
  specialMedication: string | null;
  otherSpecialMedication: string | null;
};

type SelectOption = {
  value: string;
  label: string;
};

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const PERSON_PHOTO_TYPES = [
  "image/png",
  "image/jpeg",
];

const RG_PHOTO_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
];

const sexOptions: SelectOption[] = [
  {
    value: "MALE",
    label: "Masculino",
  },
  {
    value: "FEMALE",
    label: "Feminino",
  },
];

const educationOptions: SelectOption[] = [
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

const religionOptions: SelectOption[] = [
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

const churchOptions: SelectOption[] = [
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

const cityOptions: SelectOption[] = [
  {
    value: "ITABUNA",
    label: "Itabuna",
  },
  {
    value: "OTHER",
    label: "Outra",
  },
];

const yesNoOtherOptions: SelectOption[] = [
  {
    value: "NONE",
    label: "Não",
  },
  {
    value: "OTHER",
    label: "Outro",
  },
];

function validateFile(
  file: File,
  allowedTypes: string[],
  label: string,
) {
  if (!allowedTypes.includes(file.type)) {
    return `${label} possui formato inválido.`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `${label} deve ter no máximo 10 MB.`;
  }

  return null;
}

function normalizeDateValue(
  value: string | null | undefined,
) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function getInitialValue(
  value: string | null | undefined,
) {
  return value ?? "";
}

export function GuestCompletionForm({
  token,
}: GuestCompletionFormProps) {
  const [guest, setGuest] =
    useState<GuestResponse | null>(null);

  const [age, setAge] = useState("");
  const [birthDate, setBirthDate] =
    useState("");
  const [sex, setSex] = useState("");
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
  const [phone, setPhone] =
    useState("");
  const [address, setAddress] =
    useState("");
  const [neighborhood, setNeighborhood] =
    useState("");
  const [city, setCity] = useState("");
  const [otherCity, setOtherCity] =
    useState("");
  const [cep, setCep] = useState("");

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
    personPhoto,
    setPersonPhoto,
  ] = useState<File | null>(null);

  const [rgPhoto, setRgPhoto] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  useEffect(() => {
    async function loadGuest() {
      try {
        const response = await fetch(
          `/api/convidados/${encodeURIComponent(
            token,
          )}`,
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ??
              "Não foi possível carregar o cadastro.",
          );
        }

        const loadedGuest =
          result.guest as GuestResponse;

        setGuest(loadedGuest);

        setAge(
          getInitialValue(
            loadedGuest.age,
          ),
        );

        setBirthDate(
          normalizeDateValue(
            loadedGuest.birthDate,
          ),
        );

        setSex(
          getInitialValue(
            loadedGuest.sex,
          ),
        );

        setEducation(
          getInitialValue(
            loadedGuest.education,
          ),
        );

        setReligion(
          getInitialValue(
            loadedGuest.religion,
          ),
        );

        setOtherReligion(
          getInitialValue(
            loadedGuest.otherReligion,
          ),
        );

        setChurch(
          getInitialValue(
            loadedGuest.church,
          ),
        );

        setOtherChurch(
          getInitialValue(
            loadedGuest.otherChurch,
          ),
        );

        setEmail(
          getInitialValue(
            loadedGuest.email,
          ),
        );

        setPhone(
          getInitialValue(
            loadedGuest.phone,
          ),
        );

        setAddress(
          getInitialValue(
            loadedGuest.address,
          ),
        );

        setNeighborhood(
          getInitialValue(
            loadedGuest.neighborhood,
          ),
        );

        setCity(
          getInitialValue(
            loadedGuest.city,
          ),
        );

        setOtherCity(
          getInitialValue(
            loadedGuest.otherCity,
          ),
        );

        setCep(
          getInitialValue(
            loadedGuest.cep,
          ),
        );

        setCompletionFoodRestriction(
          getInitialValue(
            loadedGuest.completionFoodRestriction,
          ) ||
            getInitialValue(
              loadedGuest.foodRestriction,
            ),
        );

        setOtherFoodRestriction(
          getInitialValue(
            loadedGuest.otherFoodRestriction,
          ),
        );

        setSpecialMedication(
          getInitialValue(
            loadedGuest.specialMedication,
          ),
        );

        setOtherSpecialMedication(
          getInitialValue(
            loadedGuest.otherSpecialMedication,
          ),
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

  function handlePersonPhotoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ?? null;

    if (!file) {
      setPersonPhoto(null);
      return;
    }

    const validationError =
      validateFile(
        file,
        PERSON_PHOTO_TYPES,
        "A foto do convidado",
      );

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      setPersonPhoto(null);
      return;
    }

    setError(null);
    setPersonPhoto(file);
  }

  function handleRgPhotoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ?? null;

    if (!file) {
      setRgPhoto(null);
      return;
    }

    const validationError =
      validateFile(
        file,
        RG_PHOTO_TYPES,
        "A foto do RG",
      );

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      setRgPhoto(null);
      return;
    }

    setError(null);
    setRgPhoto(file);
  }

  function validateTextFields() {
    if (!age.trim()) {
      return "Informe sua idade.";
    }

    const parsedAge =
      Number(age);

    if (
      !Number.isInteger(parsedAge) ||
      parsedAge < 1 ||
      parsedAge > 120
    ) {
      return "Informe uma idade válida.";
    }

    if (!birthDate) {
      return "Informe sua data de nascimento.";
    }

    if (!sex) {
      return "Selecione o sexo.";
    }

    if (!education) {
      return "Selecione sua escolaridade.";
    }

    if (!religion) {
      return "Selecione sua religião.";
    }

    if (
      religion === "OTHER" &&
      !otherReligion.trim()
    ) {
      return "Informe sua religião.";
    }

    if (!church) {
      return "Selecione a igreja.";
    }

    if (
      church === "OTHER" &&
      !otherChurch.trim()
    ) {
      return "Informe o nome da igreja.";
    }

    if (!email.trim()) {
      return "Informe seu e-mail.";
    }

    if (
      !email.includes("@") ||
      !email.includes(".")
    ) {
      return "Informe um e-mail válido.";
    }

    if (!phone.trim()) {
      return "Informe seu telefone.";
    }

    if (!address.trim()) {
      return "Informe seu endereço.";
    }

    if (!neighborhood.trim()) {
      return "Informe seu bairro.";
    }

    if (!city) {
      return "Selecione sua cidade.";
    }

    if (
      city === "OTHER" &&
      !otherCity.trim()
    ) {
      return "Informe o nome da cidade.";
    }

    if (!cep.trim()) {
      return "Informe seu CEP.";
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);

    const validationError =
      validateTextFields();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!personPhoto) {
      setError(
        "Envie a foto do convidado.",
      );
      return;
    }

    if (!rgPhoto) {
      setError("Envie a foto do RG.");
      return;
    }

    const formData = new FormData();

    formData.append(
      "age",
      age.trim(),
    );

    formData.append(
      "birthDate",
      birthDate,
    );

    formData.append(
      "sex",
      sex,
    );

    formData.append(
      "education",
      education,
    );

    formData.append(
      "religion",
      religion,
    );

    formData.append(
      "otherReligion",
      otherReligion.trim(),
    );

    formData.append(
      "church",
      church,
    );

    formData.append(
      "otherChurch",
      otherChurch.trim(),
    );

    formData.append(
      "email",
      email.trim(),
    );

    formData.append(
      "phone",
      phone.trim(),
    );

    formData.append(
      "address",
      address.trim(),
    );

    formData.append(
      "neighborhood",
      neighborhood.trim(),
    );

    formData.append(
      "city",
      city,
    );

    formData.append(
      "otherCity",
      otherCity.trim(),
    );

    formData.append(
      "cep",
      cep.trim(),
    );

    formData.append(
      "completionFoodRestriction",
      completionFoodRestriction,
    );

    formData.append(
      "otherFoodRestriction",
      otherFoodRestriction.trim(),
    );

    formData.append(
      "specialMedication",
      specialMedication,
    );

    formData.append(
      "otherSpecialMedication",
      otherSpecialMedication.trim(),
    );

    formData.append(
      "personPhoto",
      personPhoto,
      personPhoto.name,
    );

    formData.append(
      "rgPhoto",
      rgPhoto,
      rgPhoto.name,
    );

    try {
      setSubmitting(true);

      const response = await fetch(
        `/api/convidados/${encodeURIComponent(
          token,
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
            "Não foi possível salvar os dados.",
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
        <p className="text-red-100">
          {error}
        </p>
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

  if (
    guest?.completionStatus ===
      "COMPLETED"
  ) {
    return (
      <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-300" />

        <h2 className="mt-5 text-2xl font-black">
          Cadastro já concluído
        </h2>

        <p className="mt-3 text-white/70">
          Suas informações já foram recebidas pela equipe do EJC.
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
          Confira e complete seus dados.
        </p>
      </section>

      <section className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-200">
            Dados pessoais
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Informações pessoais
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Idade"
            type="number"
            value={age}
            onChange={setAge}
            placeholder="Ex.: 25"
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
              label="Qual religião?"
              value={otherReligion}
              onChange={setOtherReligion}
              placeholder="Digite sua religião"
            />
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-200">
            Igreja e contato
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Seus dados de contato
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
              label="Qual igreja?"
              value={otherChurch}
              onChange={setOtherChurch}
              placeholder="Digite o nome da igreja"
            />
          )}

          <Field
            label="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="seuemail@exemplo.com"
          />

          <Field
            label="Número de telefone"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="(73) 99999-9999"
          />

          <Field
            label="Endereço"
            value={address}
            onChange={setAddress}
            placeholder="Rua, número e complemento"
          />

          <Field
            label="Bairro"
            value={neighborhood}
            onChange={setNeighborhood}
            placeholder="Seu bairro"
          />

          <SelectField
            label="Cidade"
            value={city}
            onChange={setCity}
            options={cityOptions}
          />

          {city === "OTHER" && (
            <Field
              label="Qual cidade?"
              value={otherCity}
              onChange={setOtherCity}
              placeholder="Digite o nome da cidade"
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

      <section className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8">
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
            options={
              yesNoOtherOptions
            }
          />

          {completionFoodRestriction ===
            "OTHER" && (
            <Field
              label="Qual restrição alimentar?"
              value={
                otherFoodRestriction
              }
              onChange={
                setOtherFoodRestriction
              }
              placeholder="Descreva sua restrição"
            />
          )}

          <SelectField
            label="Medicação especial"
            value={specialMedication}
            onChange={
              setSpecialMedication
            }
            options={
              yesNoOtherOptions
            }
          />

          {specialMedication ===
            "OTHER" && (
            <Field
              label="Qual medicação especial?"
              value={
                otherSpecialMedication
              }
              onChange={
                setOtherSpecialMedication
              }
              placeholder="Informe a medicação"
            />
          )}
        </div>
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
          <FileField
            label="Foto do convidado"
            description="PNG ou JPG"
            icon="upload"
            file={personPhoto}
            accept=".png,.jpg,.jpeg"
            onChange={handlePersonPhotoChange}
          />

          <FileField
            label="Foto do RG"
            description="PNG, JPG ou PDF"
            icon="file"
            file={rgPhoto}
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleRgPhotoChange}
          />
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

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/90">
        {label}
        <span className="ml-1 text-pink-300">
          *
        </span>
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
  options: SelectOption[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/90">
        {label}
        <span className="ml-1 text-pink-300">
          *
        </span>
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-pink-300/50"
      >
        <option value="" disabled>
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

function FileField({
  label,
  description,
  icon,
  file,
  accept,
  onChange,
}: {
  label: string;
  description: string;
  icon: "upload" | "file";
  file: File | null;
  accept: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
}) {
  const Icon =
    icon === "upload"
      ? UploadCloud
      : FileText;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/90">
        {label}
        <span className="ml-1 text-pink-300">
          *
        </span>
      </span>

      <span className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-pink-200/40 bg-white/5 p-4 transition hover:bg-white/10">
        <Icon className="h-6 w-6 text-pink-200" />

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {file?.name ??
              "Selecionar arquivo"}
          </span>

          <span className="mt-1 block text-xs text-white/50">
            {description}
          </span>
        </span>

        <input
          type="file"
          className="sr-only"
          accept={accept}
          onChange={onChange}
        />
      </span>
    </label>
  );
}