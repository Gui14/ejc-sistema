"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, UserRound } from "lucide-react";

import { EjcButton } from "@/components/ui/ejc-button";
import { TextInput } from "@/components/forms/text-input";

export function AdminLoginForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ?? "Não foi possível entrar.",
        );
        return;
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8"
    >
      <div>
        <label className="block text-sm font-semibold text-white/90">
          Usuário
        </label>

        <div className="relative mt-2">
          <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />

          <TextInput
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            placeholder="Usuário"
            className="pl-12"
            autoComplete="username"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/90">
          Senha
        </label>

        <div className="relative mt-2">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />

          <TextInput
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Senha"
            className="pl-12"
            autoComplete="current-password"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      <EjcButton
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Entrando..." : "Entrar no painel"}
      </EjcButton>
    </form>
  );
}