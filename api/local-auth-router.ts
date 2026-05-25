import { z } from "zod";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { env } from "./lib/env";
import { findUserByEmail, createLocalUser } from "./queries/users";

const JWT_ALG = "HS256";

// Admin emails that always get admin role
const ADMIN_EMAILS = [
  "nexuscollabs.info@gmail.com",
  "pathakakarsh02@gmail.com",
];

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

async function signLocalToken(payload: { userId: number; email: string }): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyLocalToken(token: string): Promise<{ userId: number; email: string } | null> {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
      clockTolerance: 60,
    });
    if (!payload.userId || !payload.email) return null;
    return { userId: payload.userId as number, email: payload.email as string };
  } catch {
    return null;
  }
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        role: z.enum(["user", "admin"]).optional().default("user"),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new Error("An account with this email already exists");
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);
      // Auto-assign admin role for designated emails
      const role = isAdminEmail(input.email) ? "admin" : input.role;

      await createLocalUser({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role,
      });

      const user = await findUserByEmail(input.email);
      if (!user) throw new Error("Failed to create user");

      const token = await signLocalToken({ userId: user.id, email: user.email! });

      return {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await findUserByEmail(input.email);
      if (!user || !user.password) {
        throw new Error("Invalid email or password");
      }

      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        throw new Error("Invalid email or password");
      }

      // Ensure admin emails always have admin role
      if (isAdminEmail(user.email!) && user.role !== "admin") {
        await getDb()
          .update(schema.users)
          .set({ role: "admin" })
          .where(eq(schema.users.id, user.id));
        user.role = "admin";
      }

      await getDb()
        .update(schema.users)
        .set({ lastSignInAt: new Date() })
        .where(eq(schema.users.id, user.id));

      const token = await signLocalToken({ userId: user.id, email: user.email! });

      return {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      };
    }),

  forgotPassword: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const user = await findUserByEmail(input.email);
      if (!user) {
        return { success: true, message: "If an account exists, a reset email has been sent" };
      }
      return { success: true, message: "Password reset link sent" };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const token = ctx.req.headers.get("x-local-auth-token");
    if (!token) return null;

    const claim = await verifyLocalToken(token);
    if (!claim) return null;

    const rows = await getDb()
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, claim.userId))
      .limit(1);

    const user = rows.at(0) || null;
    // Ensure admin emails always have admin role
    if (user && isAdminEmail(user.email!) && user.role !== "admin") {
      await getDb()
        .update(schema.users)
        .set({ role: "admin" })
        .where(eq(schema.users.id, user.id));
      user.role = "admin";
    }

    return user;
  }),
});
