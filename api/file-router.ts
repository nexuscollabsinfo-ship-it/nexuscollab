import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb, insertReturningId } from "./queries/connection";
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
      const fileId = await insertReturningId(
        "uploaded_files",
        ["entitytype", "entityid", "fileurl", "filename", "filetype", "filesize"],
        [input.entityType, input.entityId, input.fileUrl, input.fileName, input.fileType, input.fileSize]
      );
      return { success: true, fileId };
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
