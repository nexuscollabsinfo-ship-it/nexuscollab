import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb, getPool, insertReturningId } from "./connection";
import { env } from "../lib/env";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function findUserByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return rows.at(0);
}

export async function findUserByPhone(phone: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.phone, phone))
    .limit(1);
  return rows.at(0);
}

export async function findUserById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };

  if (!values.role && values.unionId && values.unionId === env.ownerUnionId) {
    values.role = "admin";
  }

  if (values.unionId) {
    const existing = await findUserByUnionId(values.unionId);
    if (existing) {
      await getDb()
        .update(schema.users)
        .set({ ...values, lastSignInAt: new Date() })
        .where(eq(schema.users.unionId, values.unionId));
      return;
    }
  }

  await insertReturningId(
    "users",
    ["unionid", "name", "email", "password", "phone", "countrycode",
     "avatar", "role", "status", "emailverified", "phoneverified", "lastsigninat"],
    [values.unionId ?? null, values.name ?? null, values.email ?? null,
     values.password ?? null, values.phone ?? null, values.countryCode ?? null,
     values.avatar ?? null, values.role ?? "user", values.status ?? "active",
     values.emailVerified ?? false, values.phoneVerified ?? false, new Date()]
  );
}

export async function createLocalUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}) {
  const unionId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const id = await insertReturningId(
    "users",
    ["name", "email", "password", "role", "phone", "unionid", "status", "lastsigninat"],
    [data.name, data.email, data.password, data.role ?? "user",
     data.phone ?? null, unionId, "active", new Date()]
  );
  return [{ id }];
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  await getDb()
    .update(schema.users)
    .set({ role })
    .where(eq(schema.users.id, userId));
}
