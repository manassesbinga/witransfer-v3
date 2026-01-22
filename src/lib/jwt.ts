/** @format */

import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || "witransfer-fallback-secret-2026-secure-key"
);

/**
 * Cria um token JWT assinado
 */
export async function createToken(payload: any): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(SECRET);
}

/**
 * Verifica e decodifica um token JWT
 */
export async function verifyToken(token: string): Promise<any | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}
