export function formatarTelefone(tel?: string) {
    if (!tel) return "";
    const cleaned = tel.replace(/\D/g, "");
    if (cleaned.length === 9) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
    }
    return tel;
}

export function formatarMoeda(valor: number) {
    return new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency: "AOA",
    }).format(valor);
}

export function formatarData(data?: string) {
    if (!data) return "";
    try {
        return new Intl.DateTimeFormat("pt-PT", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(new Date(data));
    } catch (e) {
        return data;
    }
}
