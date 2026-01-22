import React from "react";

interface AssignmentEmailProps {
    booking: any;
    customerName: string;
    vehicle: any;
    driver: any;
    partner: any;
}

/**
 * Componente de Email para Notificação de Atribuição de Recursos
 */
export const AssignmentEmail: React.FC<AssignmentEmailProps> = ({
    booking,
    customerName,
    vehicle,
    driver,
    partner,
}) => {
    const bookingCode = booking.code || (booking.id ? booking.id.slice(0, 8) : "N/A");
    const isRental = booking.service_type === 'rental';

    const styles = {
        body: {
            margin: 0,
            padding: 0,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: "#f4f7f9",
            color: "#333",
        },
        wrapper: {
            width: "100%",
            tableLayout: "fixed" as const,
            backgroundColor: "#f4f7f9",
            padding: "40px 0",
        },
        container: {
            width: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            border: "1px solid #e1e8ed",
            borderRadius: "0px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
        header: {
            backgroundColor: "#003580",
            padding: "40px",
            textAlign: "center" as const,
        },
        headerTitle: {
            margin: 0,
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 900,
            letterSpacing: "-0.5px",
        },
        headerSub: {
            margin: "5px 0 0 0",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "bold",
            opacity: 0.8,
            textTransform: "uppercase" as const,
            letterSpacing: "1px",
        },
        content: {
            padding: "40px",
        },
        greeting: {
            margin: 0,
            color: "#003580",
            fontSize: "20px",
            fontWeight: 900,
        },
        sectionTitle: {
            color: "#003580",
            fontSize: "14px",
            fontWeight: 900,
            textTransform: "uppercase" as const,
            letterSpacing: "1px",
            margin: "30px 0 15px 0",
            paddingBottom: "10px",
            borderBottom: "1px solid #e1e8ed",
        },
        detailRow: {
            marginBottom: "10px",
        },
        labelSmall: {
            margin: 0,
            color: "#999",
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "1px",
            textTransform: "uppercase" as const,
        },
        value: {
            margin: "2px 0 0 0",
            color: "#333",
            fontSize: "14px",
            fontWeight: "bold",
        },
        resourceBox: {
            backgroundColor: "#f9fafb",
            padding: "20px",
            border: "1px solid #f0f2f5",
            borderRadius: "4px",
            marginTop: "15px",
        },
        footer: {
            backgroundColor: "#f9fafb",
            padding: "40px",
            textAlign: "center" as const,
            borderTop: "1px solid #e1e8ed",
        },
    };

    return (
        <div style={styles.body}>
            <table style={styles.wrapper} cellPadding="0" cellSpacing="0">
                <tr>
                    <td align="center">
                        <div style={styles.container}>
                            {/* Header */}
                            <div style={styles.header}>
                                <h1 style={styles.headerTitle}>WiTransfer</h1>
                                <p style={styles.headerSub}>Detalhes da sua Viatura</p>
                            </div>

                            {/* Content */}
                            <div style={styles.content}>
                                <h2 style={styles.greeting}>Olá {customerName},</h2>
                                <p style={{ margin: "15px 0 0 0", color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
                                    Temos o prazer de informar que os recursos para a sua reserva <strong>#{bookingCode}</strong> já foram atribuídos.
                                    Abaixo encontrará as informações da viatura e do serviço.
                                </p>

                                {/* Vehicle Section */}
                                <h3 style={styles.sectionTitle}>Informações da Viatura</h3>
                                <div style={styles.resourceBox}>
                                    <div style={styles.detailRow}>
                                        <p style={styles.labelSmall}>Viatura</p>
                                        <p style={styles.value}>{vehicle?.brand} {vehicle?.model}</p>
                                    </div>
                                    <div style={styles.detailRow}>
                                        <p style={styles.labelSmall}>Matrícula</p>
                                        <p style={styles.value}>{vehicle?.license_plate}</p>
                                    </div>
                                    {vehicle?.color && (
                                        <div style={styles.detailRow}>
                                            <p style={styles.labelSmall}>Cor</p>
                                            <p style={styles.value}>{vehicle.color}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Driver Section (if available) */}
                                {driver && (
                                    <>
                                        <h3 style={styles.sectionTitle}>Motorista Responsável</h3>
                                        <div style={styles.resourceBox}>
                                            <div style={styles.detailRow}>
                                                <p style={styles.labelSmall}>Nome</p>
                                                <p style={styles.value}>{driver.full_name}</p>
                                            </div>
                                            <div style={styles.detailRow}>
                                                <p style={styles.labelSmall}>Contacto</p>
                                                <p style={styles.value}>{driver.phone || "N/A"}</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Service Section */}
                                <h3 style={styles.sectionTitle}>Detalhes do Serviço</h3>
                                <div style={styles.detailRow}>
                                    <p style={styles.labelSmall}>Tipo de Serviço</p>
                                    <p style={styles.value}>{isRental ? 'Aluguer' : 'Transfer'}</p>
                                </div>
                                <div style={styles.detailRow}>
                                    <p style={styles.labelSmall}>Levantamento / Pick-up</p>
                                    <p style={styles.value}>
                                        {booking.pickup_address || booking.pickupLocation}<br />
                                        <span style={{ fontSize: '12px', color: '#666' }}>
                                            {new Date(booking.start_time).toLocaleDateString("pt-PT")} às {new Date(booking.start_time).toLocaleTimeString("pt-PT", { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </p>
                                </div>
                                {booking.dropoff_address && (
                                    <div style={styles.detailRow}>
                                        <p style={styles.labelSmall}>Destino / Drop-off</p>
                                        <p style={styles.value}>{booking.dropoff_address}</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div style={styles.footer}>
                                <p style={{ margin: 0, color: "#333", fontSize: "13px", fontWeight: 900 }}>WiTransfer Angola</p>
                                <div style={{ margin: "20px 0 0 0", color: "#666", fontSize: "12px" }}>
                                    <p>Parceiro Responsável: <strong>{partner?.name}</strong></p>
                                </div>
                                <div style={{ margin: "25px 0", borderTop: "1px dashed #e1e8ed", paddingTop: "25px" }}>
                                    <p style={styles.labelSmall}>Apoio ao Cliente</p>
                                    <p style={{ margin: "5px 0 0 0", color: "#003580", fontSize: "12px", fontWeight: 900 }}>+244 9XX XXX XXX  •  suporte@witransfer.ao</p>
                                </div>
                                <p style={{ margin: "20px 0 0 0", color: "#ccc", fontSize: "10px" }}>
                                    © {new Date().getFullYear()} WiTransfer. Todos os direitos reservados.
                                </p>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    );
};

export default AssignmentEmail;
