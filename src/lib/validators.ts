export function validarEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validarTelefone(tel: string) {
    return /^\d{9}$/.test(tel.replace(/\D/g, ""));
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
