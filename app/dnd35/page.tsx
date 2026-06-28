import { redirect } from "next/navigation";

// A "casa" do D&D 3.5 é o painel de mesas do usuário.
// A navegação entre seções fica no cabeçalho (navbar).
export default function Dnd35Index() {
  redirect("/dnd35/mesas");
}
