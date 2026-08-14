import { NextResponse } from "next/server";
import {
  createAdminSession,
  validateAdminCredentials,
} from "@/lib/auth/admin-session";

export const runtime = "nodejs";

type LoginPayload = {
  username?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload;

    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!username || !password) {
      return NextResponse.json(
        {
          ok: false,
          error: "Informe usuário e senha.",
        },
        { status: 400 },
      );
    }

    const valid = validateAdminCredentials(
      username,
      password,
    );

    if (!valid) {
      return NextResponse.json(
        {
          ok: false,
          error: "Usuário ou senha inválidos.",
        },
        { status: 401 },
      );
    }

    await createAdminSession(username);

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Erro no login administrativo:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível realizar o login.",
      },
      { status: 500 },
    );
  }
}