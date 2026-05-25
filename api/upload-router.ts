import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  document: ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  archive: ["application/zip", "application/x-zip-compressed"],
  design: ["application/figma", "image/x-psd", "application/x-sketch"],
};

const ALL_ALLOWED_TYPES = Object.values(ALLOWED_TYPES).flat();

export async function ensureUploadDir() {
  // No-op in serverless environments
  try {
    const { mkdir } = await import("fs/promises");
    const { join } = await import("path");
    const uploadDir = join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });
  } catch {
    // Ignore — read-only filesystem in serverless
  }
}

export const uploadRouter = createRouter({
  getUploadUrl: publicQuery
    .input(
      z.object({
        fileName: z.string().min(1),
        fileType: z.string().min(1),
        fileSize: z.number().max(MAX_FILE_SIZE),
        entityType: z.enum(["client_request", "worker_portfolio", "project_delivery"]),
        entityId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!ALL_ALLOWED_TYPES.includes(input.fileType)) {
        throw new Error("File type not allowed");
      }

      const ext = input.fileName.split(".").pop() || "bin";
      const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const fileUrl = `/api/uploads/${safeName}`;

      return {
        uploadUrl: fileUrl,
        fileUrl: fileUrl,
        safeName,
        filePath: fileUrl,
      };
    }),

  confirmUpload: publicQuery
    .input(
      z.object({
        fileUrl: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        entityType: z.enum(["client_request", "worker_portfolio", "project_delivery"]),
        entityId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await getDb().insert(schema.uploadedFiles).values({
        entityType: input.entityType,
        entityId: input.entityId,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
      });

      return {
        success: true,
        fileId: Number(result[0].insertId),
      };
    }),

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

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .delete(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.id, input.id));
      return { success: true };
    }),

  getStats: publicQuery.query(async () => {
    const allFiles = await getDb().select().from(schema.uploadedFiles);
    const totalSize = allFiles.reduce((sum, f) => sum + f.fileSize, 0);
    return {
      totalFiles: allFiles.length,
      totalSize,
      byType: allFiles.reduce((acc, f) => {
        const type = f.fileType.split("/")[0] || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }),
});
