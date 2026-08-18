"use client";

type GuestWhatsAppButtonProps = {
  name: string;
  phone: string;
  registrationUrl?: string;
};

export function GuestWhatsAppButton({
  name,
  phone,
  registrationUrl,
}: GuestWhatsAppButtonProps) {
  const digits = phone.replace(
    /\D/g,
    "",
  );

  if (!digits) {
    return (
      <span className="rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-xs text-red-200">
        WhatsApp não informado
      </span>
    );
  }

  if (!registrationUrl) {
    return (
      <span className="rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
        Link indisponível
      </span>
    );
  }

  const message =
    `Olá, ${name || "tudo bem"}!\n\n` +
    `Para completar seu cadastro do EJC, ` +
    `acesse este link:\nhttp://localhost:3000/convidado/${registrationUrl}`;

  const whatsappUrl =
    `https://wa.me/${digits}?text=${encodeURIComponent(
      message,
    )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/25"
    >
      Enviar WhatsApp
    </a>
  );
}