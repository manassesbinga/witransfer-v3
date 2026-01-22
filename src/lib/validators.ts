export function validarEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validarTelefone(tel: string) {
    // Remove todos os caracteres não numéricos exceto o +
    const cleaned = tel.replace(/[^\d+]/g, "");
    // Aceita números com 9 a 15 dígitos, com ou sem código de país (+)
    return /^\+?\d{9,15}$/.test(cleaned);
}

export function validarData(data: string) {
    return !isNaN(Date.parse(data));
}

export function validarDocumentoAngola(doc: string) {
    // Exemplo simples: 14 caracteres terminando em letras
    return doc.length >= 9;
}

export function validarCartaConducao(carta: string) {
    return carta.length >= 5;
}
