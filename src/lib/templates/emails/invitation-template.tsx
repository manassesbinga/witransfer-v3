import React from "react";

interface InvitationEmailProps {
  type: "company" | "user";
  name: string;
  companyName?: string;
  inviteLink: string;
}

export default function InvitationEmail({
  type,
  name,
  companyName,
  inviteLink,
}: InvitationEmailProps) {
  return (
    <div style={{ fontFamily: "sans-serif", color: "#333", padding: "20px" }}>
      <h2 style={{ color: "#0066ff" }}>Bem-vindo à WiTransfer!</h2>
      <p>
        Olá, <strong>{name}</strong>.
      </p>
      {type === "company" ? (
        <p>
          Sua empresa foi cadastrada com sucesso na WiTransfer. Agora você pode
          gerenciar sua frota e operações de forma centralizada.
        </p>
      ) : (
        <p>
          Você foi convidado para fazer parte da equipe da{" "}
          <strong>{companyName}</strong> na plataforma WiTransfer.
        </p>
      )}
      <p>
        Para concluir seu acesso e configurar sua senha, clique no botão abaixo:
      </p>
      <div style={{ margin: "30px 0" }}>
        <a
          href={inviteLink}
          style={{
            backgroundColor: "#0066ff",
            color: "#fff",
            padding: "12px 24px",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          Aceitar Convite e Configurar Acesso
        </a>
      </div>
      <p style={{ fontSize: "12px", color: "#999" }}>
        Se o botão acima não funcionar, copie e cole o link abaixo no seu
        navegador:
        <br />
        {inviteLink}
      </p>
      <hr
        style={{
          border: "none",
          borderTop: "1px solid #eee",
          margin: "30px 0",
        }}
      />
      <p style={{ fontSize: "12px", color: "#999 text-center" }}>
        © 2024 WiTransfer Global. Todos os direitos reservados.
      </p>
    </div>
  );
}
