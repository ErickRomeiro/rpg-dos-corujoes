"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { secoesDnd35 } from "@/lib/navegacao";
import { UsuarioNav } from "@/components/usuario-nav";

export function Cabecalho() {
  const pathname = usePathname();

  // As seções são específicas de cada sistema. Por enquanto, mostramos as do
  // D&D 3.5 apenas quando o usuário está dentro de /dnd35.
  const emDnd35 = pathname.startsWith("/dnd35");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <span aria-hidden className="text-2xl">
            🦉
          </span>
          <span>
            RPG dos <span className="text-accent">Corujões</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {emDnd35 && (
            <ul className="flex items-center gap-1 sm:gap-2">
              {secoesDnd35.map((secao) => {
                const ativo =
                  pathname === secao.href ||
                  pathname.startsWith(`${secao.href}/`);
                return (
                  <li key={secao.href}>
                    <Link
                      href={secao.href}
                      aria-current={ativo ? "page" : undefined}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        ativo
                          ? "bg-surface-2 text-accent"
                          : "text-muted hover:bg-surface hover:text-foreground"
                      }`}
                    >
                      <span aria-hidden className="mr-1.5">
                        {secao.icone}
                      </span>
                      <span className="hidden sm:inline">{secao.rotulo}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <UsuarioNav />
        </div>
      </nav>
    </header>
  );
}
