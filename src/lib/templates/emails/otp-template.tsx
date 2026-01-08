import React from "react";

interface WitransferOtpEmailProps {
  otpCode: string;
  userName?: string;
}

/**
 * Componente de Email OTP para a WITRANSFER
 */
const WitransferOtpEmail: React.FC<WitransferOtpEmailProps> = ({
  otpCode = "123456",
  userName = "",
}) => {
  const styles = {
    body: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f8fafc",
      margin: "0",
      padding: "20px",
    },
    container: {
      maxWidth: "600px",
      margin: "0 auto",
      backgroundColor: "#ffffff",
      borderRadius: "0px",
      overflow: "hidden",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e2e8f0",
    },
    header: {
      backgroundColor: "#2563eb",
      padding: "30px",
      textAlign: "center" as const,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    logoImage: {
      width: "32px",
      height: "32px",
      borderRadius: "0px",
    },
    logoText: {
      color: "#ffffff",
      margin: "0",
      fontSize: "24px",
      letterSpacing: "1px",
      fontWeight: "bold",
    },
    content: {
      padding: "40px 30px",
      color: "#334155",
      lineHeight: "1.6",
    },
    title: {
      color: "#1e293b",
      fontSize: "20px",
      marginTop: "0",
    },
    otpBox: {
      backgroundColor: "#f1f5f9",
      borderRadius: "0px",
      padding: "25px",
      margin: "30px 0",
      border: "2px dashed #cbd5e1",
      textAlign: "center" as const,
    },
    otpLabel: {
      marginBottom: "10px",
      fontSize: "14px",
      color: "#64748b",
      textTransform: "uppercase" as const,
      fontWeight: "bold",
    },
    otpValue: {
      fontSize: "36px",
      fontWeight: "800",
      color: "#2563eb",
      letterSpacing: "8px",
      margin: "0",
    },
    footer: {
      padding: "20px",
      textAlign: "center" as const,
      fontSize: "12px",
      color: "#94a3b8",
      backgroundColor: "#f8fafc",
      borderTop: "1px solid #e2e8f0",
    },
    warning: {
      fontSize: "13px",
      color: "#64748b",
      marginTop: "20px",
      paddingTop: "20px",
      borderTop: "1px solid #f1f5f9",
    },
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        {/* Cabeçalho */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <img
              src={`${appUrl}/logo.png`}
              alt="Logo WITRANSFER"
              style={styles.logoImage}
            />
            <h1 style={styles.logoText}>
              WI<span style={{ opacity: 0.9 }}>TRANSFER</span>
            </h1>
          </div>
        </div>

        {/* Conteúdo */}
        <div style={styles.content}>
          <h2 style={styles.title}>Olá{userName ? `, ${userName}` : ""},</h2>
          <p>
            Recebemos um pedido de acesso à sua conta{" "}
            <strong>WITRANSFER</strong>. Utilize o código de verificação abaixo
            para completar o seu login:
          </p>

          <div style={styles.otpBox}>
            <p style={styles.otpLabel}>O seu código de verificação</p>
            <div style={styles.otpValue}>{otpCode}</div>
            <p
              style={{ marginTop: "10px", fontSize: "13px", color: "#94a3b8" }}
            >
              Este código expira em{" "}
              <span style={{ color: "#2563eb", fontWeight: "600" }}>
                10 minutos
              </span>
              .
            </p>
          </div>

          <p>
            Se não solicitou este código, pode ignorar este e-mail com
            segurança. A sua conta permanecerá protegida.
          </p>

          <div style={styles.warning}>
            <strong>Dica de Segurança:</strong> Nunca partilhe este código com
            ninguém. A nossa equipa de suporte nunca lhe pedirá o seu código de
            verificação por telefone ou e-mail.
          </div>
        </div>

        {/* Rodapé */}
        <div style={styles.footer}>
          <p>
            &copy; 2024 WITRANSFER - Soluções de Transferência Segura.
            <br />
            Este é um e-mail automático, por favor não responda.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WitransferOtpEmail;
