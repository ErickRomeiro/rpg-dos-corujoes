import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { SessaoProvider } from "@/components/sessao-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RPG dos Corujões",
    template: "%s · RPG dos Corujões",
  },
  description:
    "Ferramentas para Dungeons & Dragons 3.5: fichas de personagem, compêndio de regras e utilitários de mesa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SessaoProvider>
          <Cabecalho />
          <main className="flex-1">{children}</main>
          <Rodape />
        </SessaoProvider>
      </body>
    </html>
  );
}
