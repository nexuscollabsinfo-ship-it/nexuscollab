import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const fileRouter = createRouter({
  listByEntity: publicQuery
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.entityId, input.entityId))
        .orderBy(desc(schema.uploadedFiles.createdAt));
    }),

  save: publicQuery
    .input(
      z.object({
        entityType: z.enum(["client_request", "worker_portfolio", "project_delivery"]),
        entityId: z.number(),
        fileUrl: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await getDb().insert(schema.uploadedFiles).values(input);
      return { success: true, fileId: Number(result[0].insertId) };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .delete(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.id, input.id));
      return { success: true };
    }),
});
