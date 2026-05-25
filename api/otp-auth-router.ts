import { z } from "zod";
import * as jose from "jose";
import { eq, and, gt } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { env } from "./lib/env";
import { findUserByPhone } from "./queries/users";

const JWT_ALG = "HS256";

async function signLocalToken(payload: { userId: number; email: string }): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const otpAuthRouter = createRouter({
  sendCode: publicQuery
    .input(
      z.object({
        phone: z.string().min(5),
        countryCode: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await getDb().insert(schema.otpCodes).values({
        phone: input.phone,
        countryCode: input.countryCode,
        code,
        expiresAt,
      });

      return {
        success: true,
        message: `OTP sent successfully. Your code is: ${code}`,
        devCode: code,
      };
    }),

  verifyCode: publicQuery
    .input(
      z.object({
        phone: z.string(),
        countryCode: z.string(),
        code: z.string().length(6),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const otpRows = await getDb()
        .select()
        .from(schema.otpCodes)
        .where(
          and(
            eq(schema.otpCodes.phone, input.phone),
            eq(schema.otpCodes.countryCode, input.countryCode),
            eq(schema.otpCodes.code, input.code),
            eq(schema.otpCodes.used, false),
            gt(schema.otpCodes.expiresAt, new Date())
          )
        )
        .orderBy(schema.otpCodes.createdAt)
        .limit(1);

      const otp = otpRows.at(0);
      if (!otp) {
        throw new Error("Invalid or expired OTP code");
      }

      await getDb()
        .update(schema.otpCodes)
        .set({ used: true })
        .where(eq(schema.otpCodes.id, otp.id));

      let user = await findUserByPhone(input.phone);

      if (!user) {
        const unionId = `phone_${input.countryCode}_${input.phone}_${Date.now()}`;
        await getDb().insert(schema.users).values({
          name: input.name || `User ${input.phone}`,
          phone: input.phone,
          countryCode: input.countryCode,
          unionId,
          role: "user",
          phoneVerified: true,
          status: "active",
          lastSignInAt: new Date(),
        });
        user = await findUserByPhone(input.phone);
      } else {
        await getDb()
          .update(schema.users)
          .set({ phoneVerified: true, lastSignInAt: new Date() })
          .where(eq(schema.users.id, user.id));
      }

      if (!user) throw new Error("Failed to create or find user");

      const token = await signLocalToken({ userId: user.id, email: user.email || `${user.phone}@nexus.local` });

      return {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        },
      };
    }),
});
