"use client";

import { useSearchParams } from "next/navigation";
import { SearchHero } from "@/components/search/hero";
import { SearchForm } from "@/components/search/form";

export default function HomePage() {
  const searchParams = useSearchParams();

  // Determinar tipo baseado na URL (padrão: rental)
  const searchType =
    (searchParams.get("type") as "rental" | "transfer") || "rental";

  // Título dinâmico baseado no tipo
  const pageTitle =
    searchType === "transfer"
      ? "Transfers e Viagens – Conforto e Segurança do Início ao Fim"
      : "Aluguel de Carros – Pesquise, Compare e Economize";

  return (
    <SearchHero title={pageTitle} checkboxes={[]}>
      <SearchForm type={searchType} />
    </SearchHero>
  );
}
