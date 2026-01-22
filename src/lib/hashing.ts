/** @format */
import bcrypt from "bcryptjs";

/**
 * Gera um hash seguro para a senha
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Compara uma senha em texto plano com um hash
 */
export async function comparePassword(password: string, hashed: string): Promise<boolean> {
    if (!password || !hashed) return false;
    return bcrypt.compare(password, hashed);
}
