import type { Metadata } from "next";
import { EmConstrucao } from "@/components/em-construcao";

export const metadata: Metadata = {
  title: "Fichas · D&D 3.5",
  description: "Crie e gerencie suas fichas de personagem de D&D 3.5.",
};

export default function FichasPage() {
  return (
    <EmConstrucao
      icone="📜"
      titulo="Fichas de personagem"
      descricao="Em breve você poderá criar, salvar e gerenciar fichas completas de D&D 3.5, com cálculos automáticos de atributos, perícias e combate."
      planejado={[
        "Criação guiada: raça, classe, atributos e perícias",
        "Cálculos automáticos (CA, ataques, testes de resistência)",
        "Salvamento na sua conta, acessível de qualquer lugar",
        "Magias, equipamento e inventário",
      ]}
    />
  );
}
