import type { Metadata } from "next";
import { EmConstrucao } from "@/components/em-construcao";

export const metadata: Metadata = {
  title: "Utilitários · D&D 3.5",
  description: "Rolador de dados e geradores rápidos para a mesa de D&D 3.5.",
};

export default function UtilitariosPage() {
  return (
    <EmConstrucao
      icone="🎲"
      titulo="Utilitários de mesa"
      descricao="Em breve, ferramentas rápidas para usar durante o jogo: rolador de dados com modificadores e geradores de personagens e NPCs."
      planejado={[
        "Rolador de dados (d20, vantagem, modificadores)",
        "Gerador rápido de NPCs",
        "Gerador de nomes e tesouros",
        "Histórico de rolagens da sessão",
      ]}
    />
  );
}
