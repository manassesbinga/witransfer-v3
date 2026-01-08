"use server";

import { createPublicAction } from "@/middlewares/actions/action-factory";

export async function validateNif(identifier: string) {
  return createPublicAction(
    "ValidateNif",
    async (id: string) => {
      if (!id) throw new Error("Identificador é obrigatório");

      const response = await fetch(
        `https://sepe.gov.ao/catalogo/eservicos/consulta-de-nif`,
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=UTF-8",
            accept: "text/x-component",
            "next-action": "405c4cb894c06ca674522da0e4ccc92b5dde78a64d",
            origin: "https://sepe.gov.ao",
            referer: "https://sepe.gov.ao/catalogo/eservicos/consulta-de-nif",
            "user-agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
          },
          body: JSON.stringify([id]),
          next: { revalidate: 3600 },
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao validar identificador no SEPE");
      }

      const text = await response.text();
      const lines = text.split("\n");

      for (const line of lines) {
        if (line.includes('"success":true')) {
          const jsonPart = line.substring(line.indexOf("{"));
          const result = JSON.parse(jsonPart);

          if (result.success) {
            return {
              success: true,
              data: {
                nif: result.data.nif,
                name: result.data.nome,
                type: result.data.tipoContribuinte,
                status: result.data.estado,
                reparticao: result.data.reparticao,
                date: result.data.data,
              },
            };
          }
        }
      }

      return {
        success: false,
        message: "Identificador não encontrado ou inválido",
      };
    },
    identifier,
  );
}
