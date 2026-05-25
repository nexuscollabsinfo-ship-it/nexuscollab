import { z } from "zod";
import { eq, desc, sql, like, or } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const userRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        search: z.string().optional(),
        role: z.string().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { page = 1, limit = 20, search } = input || {};
      const offset = (page - 1) * limit;

      let conditions = undefined;
      if (search) {
        conditions = or(
          like(schema.users.name, `%${search}%`),
          like(schema.users.email, `%${search}%`)
        );
      }

      const rows = await getDb()
        .select()
        .from(schema.users)
        .where(conditions)
        .orderBy(desc(schema.users.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await getDb()
        .select({ count: sql<number>`count(*)` })
        .from(schema.users);

      return {
        users: rows,
        total: countResult[0]?.count || 0,
      };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await getDb()
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, input.id))
        .limit(1);
      return rows.at(0);
    }),

  updateRole: publicQuery
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.users)
        .set({ role: input.role })
        .where(eq(schema.users.id, input.id));

      await getDb().insert(schema.activityLogs).values({
        entityType: "user",
        entityId: input.id,
        action: `Role updated to ${input.role}`,
        details: { role: input.role },
      });

      return { success: true };
    }),

  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["active", "inactive", "banned"]),
      })
    )
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.users)
        .set({ status: input.status })
        .where(eq(schema.users.id, input.id));

      await getDb().insert(schema.activityLogs).values({
        entityType: "user",
        entityId: input.id,
        action: `Status updated to ${input.status}`,
        details: { status: input.status },
      });

      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .delete(schema.users)
        .where(eq(schema.users.id, input.id));

      await getDb().insert(schema.activityLogs).values({
        entityType: "user",
        entityId: input.id,
        action: "User deleted",
      });

      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const totalUsers = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.users);
    const adminCount = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(eq(schema.users.role, "admin"));
    const activeUsers = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(eq(schema.users.status, "active"));
    const oauthUsers = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(sql`unionId IS NOT NULL`);
    const localUsers = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(sql`password IS NOT NULL`);

    return {
      totalUsers: totalUsers[0]?.count || 0,
      adminCount: adminCount[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      oauthUsers: oauthUsers[0]?.count || 0,
      localUsers: localUsers[0]?.count || 0,
    };
  }),
});
