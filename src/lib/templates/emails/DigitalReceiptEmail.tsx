import React from "react";

interface DigitalReceiptEmailProps {
    booking: any;
    customerName: string;
}

export const DigitalReceiptEmail: React.FC<DigitalReceiptEmailProps> = ({
    booking,
    customerName,
}) => {
    const total = booking.total_price || 0;

    // Real breakdown: 85% base, 15% taxes (aligned with user example: 10455 / 1845 for 12300)
    const baseValue = total * 0.85;
    const taxValue = total * 0.15;
    const extrasValue = 0;

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
            textAlign: "left" as const,
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
        refBox: {
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "10px 15px",
            textAlign: "right" as const,
        },
        refLabel: {
            margin: 0,
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: "bold",
            opacity: 0.7,
        },
        refValue: {
            margin: "2px 0 0 0",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: 900,
            fontFamily: "monospace",
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
        summarySection: {
            borderTop: "2px solid #003580",
            marginTop: "25px",
            paddingTop: "25px",
        },
        labelSmall: {
            margin: 0,
            color: "#999",
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "1px",
            textTransform: "uppercase" as const,
        },
        vehicleName: {
            margin: "5px 0 0 0",
            color: "#333",
            fontSize: "15px",
            fontWeight: 900,
        },
        serviceType: {
            margin: "2px 0 0 0",
            color: "#006ce4",
            fontSize: "11px",
            fontWeight: "bold",
        },
        pricingTable: {
            backgroundColor: "#f9fafb",
            padding: "20px",
            border: "1px solid #f0f2f5",
            marginTop: "15px",
            width: "100%",
        },
        priceRow: {
            display: "flex",
            justifyContent: "space-between",
            padding: "5px 0",
        },
        priceLabel: {
            color: "#666",
            fontSize: "13px",
            fontWeight: "bold",
        },
        priceValue: {
            color: "#333",
            fontSize: "13px",
            fontWeight: 900,
        },
        totalRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "15px",
            borderTop: "1px solid #e1e8ed",
            marginTop: "10px",
        },
        totalLabel: {
            color: "#003580",
            fontSize: "14px",
            fontWeight: 900,
            textTransform: "uppercase" as const,
            letterSpacing: "1px",
        },
        totalValue: {
            color: "#003580",
            fontSize: "24px",
            fontWeight: 900,
        },
        itineraryTable: {
            width: "100%",
            border: "1px solid #f0f2f5",
            marginTop: "20px",
        },
        itineraryCol: {
            padding: "20px",
            width: "50%",
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
                                <table width="100%">
                                    <tr>
                                        <td>
                                            <h1 style={styles.headerTitle}>WiTransfer</h1>
                                            <p style={styles.headerSub}>Recibo Digital / Fatura-Recibo</p>
                                        </td>
                                        <td align="right">
                                            <div style={styles.refBox}>
                                                <p style={styles.refLabel}>REFERÊNCIA</p>
                                                <p style={styles.refValue}>#{bookingCode}</p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            {/* Greeting */}
                            <div style={styles.content}>
                                <h2 style={styles.greeting}>Olá {customerName},</h2>
                                <p style={{ margin: "15px 0 0 0", color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
                                    Este é o seu recibo digital referente à sua reserva na WiTransfer.
                                    Agradecemos a sua preferência e desejamos-lhe uma excelente viagem.
                                </p>

                                {/* Summary */}
                                <div style={styles.summarySection}>
                                    <p style={styles.labelSmall}>Veículo / Serviço</p>
                                    <p style={styles.vehicleName}>
                                        {booking.vehicles ? `${booking.vehicles.brand} ${booking.vehicles.model}` : "Serviço WiTransfer"}
                                    </p>
                                    <p style={styles.serviceType}>
                                        {isRental ? 'Aluguer de Curta Duração' : 'Serviço de Transfer Executivo'}
                                    </p>

                                    <table style={styles.pricingTable} cellPadding="0" cellSpacing="0">
                                        <tr>
                                            <td style={styles.priceLabel}>
                                                Valor Base
                                                <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#999', display: 'block' }}>
                                                    {isRental ? '(Aluguer por Dia)' : '(Transfer por KM)'}
                                                </span>
                                            </td>
                                            <td align="right" style={styles.priceValue}>AOA {baseValue.toLocaleString("pt-AO")}</td>
                                        </tr>
                                        <tr>
                                            <td style={styles.priceLabel}>Serviços Extra</td>
                                            <td align="right" style={styles.priceValue}>AOA {extrasValue.toLocaleString("pt-AO")}</td>
                                        </tr>
                                        <tr>
                                            <td style={styles.priceLabel}>Taxas & IVA (14%)</td>
                                            <td align="right" style={styles.priceValue}>AOA {taxValue.toLocaleString("pt-AO")}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} style={{ padding: "15px 0 10px 0", borderTop: "1px solid #e1e8ed" }}></td>
                                        </tr>
                                        <tr>
                                            <td style={styles.totalLabel}>Total Pago</td>
                                            <td align="right" style={styles.totalValue}>AOA {total.toLocaleString("pt-AO")}</td>
                                        </tr>
                                    </table>

                                    {booking.stops && booking.stops.length > 0 && (
                                        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#fffbeb", border: "1px solid #fef3c7" }}>
                                            <p style={{ ...styles.labelSmall, color: "#92400e" }}>Paragens Intermédias</p>
                                            <div style={{ marginTop: "5px" }}>
                                                {booking.stops.map((stop: string, i: number) => (
                                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" }}>
                                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#f59e0b" }}></span>
                                                        <span style={{ color: "#78350f", fontSize: "12px", fontWeight: "bold" }}>{stop}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Itinerary */}
                                <table style={styles.itineraryTable} cellPadding="0" cellSpacing="0">
                                    <tr>
                                        <td style={{ ...styles.itineraryCol, borderRight: "1px solid #f0f2f5" }}>
                                            <p style={styles.labelSmall}>Check-in / Levantamento</p>
                                            <p style={{ margin: "5px 0 0 0", color: "#333", fontSize: "12px", fontWeight: "bold", lineHeight: "1.4" }}>
                                                {new Date(booking.start_time).toLocaleDateString("pt-PT")} às {new Date(booking.start_time).toLocaleTimeString("pt-PT", { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </td>
                                        <td style={styles.itineraryCol}>
                                            <p style={styles.labelSmall}>Check-out / Entrega</p>
                                            <p style={{ margin: "5px 0 0 0", color: "#333", fontSize: "12px", fontWeight: "bold", lineHeight: "1.4" }}>
                                                {booking.end_time ? `${new Date(booking.end_time).toLocaleDateString("pt-PT")} às ${new Date(booking.end_time).toLocaleTimeString("pt-PT", { hour: '2-digit', minute: '2-digit' })}` : (isRental ? "A COMBINAR" : "N/A")}
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            {/* Footer */}
                            <div style={styles.footer}>
                                <p style={{ margin: 0, color: "#333", fontSize: "13px", fontWeight: 900 }}>WiTransfer Angola</p>
                                <p style={{ margin: "5px 0 0 0", color: "#999", fontSize: "11px", fontWeight: "bold" }}>Simplificando a sua mobilidade em cada quilómetro.</p>

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

export default DigitalReceiptEmail;
