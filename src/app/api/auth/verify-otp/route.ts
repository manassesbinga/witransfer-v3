import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createToken } from "@/lib/jwt";

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                { success: false, error: "E-mail e código são obrigatórios" },
                { status: 400 },
            );
        }

        // 1. Buscar usuário com este email e OTP válido
        const { data: user, error } = await supabaseAdmin
            .from("users")
            .select("*")
            .eq("email", email.toLowerCase())
            .eq("otp_code", otp)
            .single();

        if (error || !user) {
            return NextResponse.json(
                { success: false, error: "Código inválido ou e-mail não encontrado" },
                { status: 401 },
            );
        }

        // 2. Verificar expiração
        const now = new Date();
        const expiry = new Date(user.otp_expiry);

        if (now > expiry) {
            return NextResponse.json(
                { success: false, error: "Este código expirou. Peça um novo." },
                { status: 401 },
            );
        }

        // 3. Limpar OTP para evitar reuso
        await supabaseAdmin
            .from("users")
            .update({
                otp_code: null,
                otp_expiry: null,
                updated_at: new Date().toISOString()
            })
            .eq("id", user.id);

        // 4. Gerar JWT se necessário (opcional, mas bom pra segurança)
        const token = await createToken({
            id: user.id,
            email: user.email,
            role: user.role,
            full_name: user.full_name
        });

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role
            }
        });

        // Definir cookie de autenticação
        response.cookies.set("is_auth", "true", { path: "/", maxAge: 86400 });
        response.cookies.set("user_token", token, { path: "/", maxAge: 86400, httpOnly: true });

        return response;
    } catch (error: any) {
        console.error("Error in verify-otp:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Falha ao verificar código",
                details: error.message,
            },
            { status: 500 },
        );
    }
}
