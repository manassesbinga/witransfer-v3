"use server";

import fs from "fs/promises";
import path from "path";
import { createPublicAction } from "@/middlewares/actions/action-factory";

const DB_PATH = path.join(process.cwd(), "src/data/db.json");

async function getDb() {
  const data = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(data);
}

async function saveDb(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function getUserByEmail(email: string) {
  return createPublicAction(
    "GetUserByEmail",
    async (emailStr: string) => {
      const db = await getDb();
      const user = db.users.find(
        (u: any) => u.email.toLowerCase() === emailStr.toLowerCase(),
      );

      return {
        data: user || null,
        exists: !!user,
      };
    },
    email,
  );
}

export async function createUser(userData: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  return createPublicAction(
    "CreateUser",
    async (data: any) => {
      const db = await getDb();

      const existingUser = db.users.find(
        (u: any) => u.email.toLowerCase() === data.email.toLowerCase(),
      );

      if (existingUser) {
        throw new Error("Usuário já existe com este email");
      }

      const newUser = {
        id: `USR-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        ...data,
        createdAt: new Date().toISOString(),
      };

      db.users.push(newUser);
      await saveDb(db);

      return {
        data: newUser,
        message: "Usuário criado com sucesso",
      };
    },
    userData,
  );
}

export async function getUserBookings(userId: string) {
  return createPublicAction(
    "GetUserBookings",
    async (id: string) => {
      const db = await getDb();
      return db.bookings.filter((b: any) => b.userId === id);
    },
    userId,
  );
}
