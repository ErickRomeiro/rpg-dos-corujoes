import type { Metadata } from "next";
import { EmConstrucao } from "@/components/em-construcao";

export const metadata: Metadata = {
  title: "Mestre · D&D 3.5",
  description: "Ferramentas de narração para o Mestre de D&D 3.5.",
};

export default function MestrePage() {
  return (
    <EmConstrucao
      icone="🐉"
      titulo="Ferramentas de Mestre"
      descricao="Em breve, um painel para quem narra: gerenciar campanhas, rastrear iniciativa e combate, montar encontros e organizar NPCs."
      planejado={[
        "Rastreador de iniciativa e combate",
        "Construtor de encontros com cálculo de ND",
        "Gerenciador de campanhas e sessões",
        "Biblioteca de NPCs e monstros",
      ]}
    />
  );
}
