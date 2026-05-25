import { z } from "zod";
import { eq, desc, like, or, sql } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const clientRequestRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        fullName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        discordUsername: z.string().optional(),
        instagramUsername: z.string().optional(),
        country: z.string().min(1),
        leadSource: z.string().min(1),
        serviceNeeded: z.string().min(1),
        projectDetails: z.string().min(10),
        budgetRange: z.string().min(1),
        deadline: z.string().min(1),
        paymentMethod: z.string().min(1),
        referenceFiles: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await getDb().insert(schema.clientRequests).values({
        ...input,
        referenceFiles: input.referenceFiles || [],
      });

      const requestId = Number(result[0].insertId);

      await getDb().insert(schema.activityLogs).values({
        entityType: "client",
        entityId: requestId,
        action: "New client request submitted",
        performedBy: null,
        details: { service: input.serviceNeeded, budget: input.budgetRange },
      });

      return { success: true, requestId };
    }),

  myRequests: publicQuery.query(async () => {
    return [];
  }),

  list: publicQuery
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        status: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { page = 1, limit = 20, status, search } = input || {};
      const offset = (page - 1) * limit;

      let conditions = undefined;
      if (status) {
        conditions = eq(schema.clientRequests.status, status as any);
      }
      if (search) {
        const searchCondition = or(
          like(schema.clientRequests.fullName, `%${search}%`),
          like(schema.clientRequests.email, `%${search}%`),
          like(schema.clientRequests.serviceNeeded, `%${search}%`)
        );
        conditions = conditions ? or(conditions, searchCondition)! : searchCondition!;
      }

      const rows = await getDb()
        .select()
        .from(schema.clientRequests)
        .where(conditions)
        .orderBy(desc(schema.clientRequests.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await getDb()
        .select({ count: sql<number>`count(*)` })
        .from(schema.clientRequests);

      return {
        requests: rows.map(r => ({
          ...r,
          referenceFiles: typeof r.referenceFiles === "string" ? JSON.parse(r.referenceFiles) : r.referenceFiles ?? [],
        })),
        total: countResult[0]?.count || 0,
      };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await getDb()
        .select()
        .from(schema.clientRequests)
        .where(eq(schema.clientRequests.id, input.id))
        .limit(1);
      const row = rows.at(0);
      if (!row) return undefined;
      return {
        ...row,
        referenceFiles: typeof row.referenceFiles === "string" ? JSON.parse(row.referenceFiles) : row.referenceFiles ?? [],
      };
    }),

  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "reviewing", "assigned", "in_progress", "completed", "cancelled"]),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.clientRequests)
        .set({
          status: input.status,
          adminNotes: input.adminNotes,
          updatedAt: new Date(),
        })
        .where(eq(schema.clientRequests.id, input.id));

      await getDb().insert(schema.activityLogs).values({
        entityType: "client",
        entityId: input.id,
        action: `Status updated to ${input.status}`,
        performedBy: null,
        details: { status: input.status },
      });

      return { success: true };
    }),

  assignWorker: publicQuery
    .input(z.object({ id: z.number(), workerId: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.clientRequests)
        .set({
          assignedWorkerId: input.workerId,
          status: "assigned",
          updatedAt: new Date(),
        })
        .where(eq(schema.clientRequests.id, input.id));

      await getDb().insert(schema.activityLogs).values({
        entityType: "client",
        entityId: input.id,
        action: "Worker assigned",
        performedBy: null,
        details: { workerId: input.workerId },
      });

      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .delete(schema.clientRequests)
        .where(eq(schema.clientRequests.id, input.id));

      await getDb().insert(schema.activityLogs).values({
        entityType: "client",
        entityId: input.id,
        action: "Client request deleted",
        performedBy: null,
        details: {},
      });

      return { success: true };
    }),
});
