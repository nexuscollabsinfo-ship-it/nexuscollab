import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb, insertReturningId } from "./queries/connection";
import * as schema from "@db/schema";

export const projectRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        clientRequestId: z.number(),
        title: z.string().min(1),
        description: z.string().min(1),
        assignedWorkerId: z.number().optional(),
        deadline: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      })
    )
    .mutation(async ({ input }) => {
      const projectId = await insertReturningId(
        "projects",
        ["clientrequestid", "assignedworkerid", "title", "description",
         "status", "priority", "startdate", "deadline"],
        [input.clientRequestId, input.assignedWorkerId ?? null,
         input.title, input.description,
         input.assignedWorkerId ? "assigned" : "pending",
         input.priority, new Date(),
         input.deadline ? new Date(input.deadline) : null]
      );

      await insertReturningId(
        "activity_logs",
        ["entitytype", "entityid", "action", "details"],
        ["project", projectId, "New project created", JSON.stringify({ title: input.title })]
      );

      if (input.assignedWorkerId) {
        await getDb()
          .update(schema.clientRequests)
          .set({ status: "assigned", assignedWorkerId: input.assignedWorkerId })
          .where(eq(schema.clientRequests.id, input.clientRequestId));
      }

      return { success: true, projectId };
    }),

  list: publicQuery
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { page = 1, limit = 20, status } = input || {};
      const offset = (page - 1) * limit;

      const rows = await getDb()
        .select()
        .from(schema.projects)
        .where(status ? eq(schema.projects.status, status as any) : undefined)
        .orderBy(desc(schema.projects.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await getDb()
        .select({ count: sql<number>`count(*)` })
        .from(schema.projects);

      return {
        projects: rows,
        total: Number(countResult[0]?.count) || 0,
      };
    }),

  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "assigned", "in_progress", "review", "delivered", "completed", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const updates: any = { status: input.status, updatedAt: new Date() };
      if (input.status === "completed") updates.completionDate = new Date();

      await getDb()
        .update(schema.projects)
        .set(updates)
        .where(eq(schema.projects.id, input.id));

      return { success: true };
    }),

  addNotes: publicQuery
    .input(z.object({ id: z.number(), notes: z.string() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.projects)
        .set({ internalNotes: input.notes })
        .where(eq(schema.projects.id, input.id));

      return { success: true };
    }),
});
