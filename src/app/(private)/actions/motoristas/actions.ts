"use server";

import { getDB, saveDB } from "@/lib/db-admin";
import { revalidatePath } from "next/cache";

export async function getMotoristasAction() {
    try {
        const db = getDB();
        return { success: true, data: db.motoristas || [] };
    } catch (error) {
        return { success: false, error: "Erro ao carregar motoristas" };
    }
}

export async function createMotoristaAction(data: any) {
    try {
        const db = getDB();
        const newId = `driver-${Date.now()}`;
        const newMotorista = {
            ...data,
            id: newId,
            createdAt: new Date().toISOString(),
            numeroViagens: Math.floor(Math.random() * 50), // Mock inicial
            pontuacao: 5.0,
            ganhoTotal: 0,
            status: data.status || "offline",
            companyId: data.companyId || "comp-001",
        };
        db.motoristas = [...(db.motoristas || []), newMotorista];
        saveDB(db);
        revalidatePath("/admin/motoristas");
        return { success: true, data: newMotorista };
    } catch (error) {
        return { success: false, error: "Erro ao criar motorista" };
    }
}

export async function updateMotoristaAction(id: string, data: any) {
    try {
        const db = getDB();
        db.motoristas = (db.motoristas || []).map((m: any) =>
            m.id === id ? { ...m, ...data } : m
        );
        saveDB(db);
        revalidatePath("/admin/motoristas");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro ao atualizar motorista" };
    }
}

export async function deleteMotoristaAction(id: string) {
    try {
        const db = getDB();
        db.motoristas = (db.motoristas || []).filter((m: any) => m.id !== id);
        saveDB(db);
        revalidatePath("/admin/motoristas");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro ao excluir motorista" };
    }
}
