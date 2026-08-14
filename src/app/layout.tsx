import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EJC | Cadastro",
  description: "Cadastro de convidados do Encontro de Jovens com Cristo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}