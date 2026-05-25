import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const workerApplicationRouter = createRouter({
  submit: publicQuery
    .input(
      z.object({
        fullName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        discordUsername: z.string().optional(),
        instagramUsername: z.string().optional(),
        country: z.string().min(1),
        workType: z.enum(["part_time", "full_time"]),
        skills: z.array(z.string()).min(1),
        minPrice: z.number().min(0),
        maxPrice: z.number().min(0),
        deliveryTime: z.string().min(1),
        paymentMethods: z.array(z.string()).min(1),
        portfolios: z.array(
          z.object({
            skillName: z.string(),
            portfolioFiles: z.array(z.string()).optional(),
            softwareTools: z.array(z.string()).optional(),
            experienceDetails: z.string().optional(),
            yearsOfExperience: z.number().optional(),
            skillLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await getDb().insert(schema.workerApplications).values({
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        discordUsername: input.discordUsername,
        instagramUsername: input.instagramUsername,
        country: input.country,
        workType: input.workType,
        skills: input.skills,
        minPrice: input.minPrice.toString(),
        maxPrice: input.maxPrice.toString(),
        deliveryTime: input.deliveryTime,
        paymentMethods: input.paymentMethods,
      });

      const workerId = Number(result[0].insertId);

      if (input.portfolios && input.portfolios.length > 0) {
        for (const portfolio of input.portfolios) {
          await getDb().insert(schema.workerPortfolios).values({
            workerId,
            skillName: portfolio.skillName,
            portfolioFiles: portfolio.portfolioFiles || [],
            softwareTools: portfolio.softwareTools || [],
            experienceDetails: portfolio.experienceDetails,
            yearsOfExperience: portfolio.yearsOfExperience,
            skillLevel: portfolio.skillLevel,
          });
        }
      }

      await getDb().insert(schema.activityLogs).values({
        entityType: "worker",
        entityId: workerId,
        action: "New worker application submitted",
        performedBy: null,
        details: { skills: input.skills, workType: input.workType },
      });

      return { success: true, applicationId: workerId };
    }),

  myApplication: publicQuery.query(async () => {
    return null;
  }),

  list: publicQuery
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        status: z.string().optional(),
        skill: z.string().optional(),
        country: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { page = 1, limit = 20, status } = input || {};
      const offset = (page - 1) * limit;

      const rows = await getDb()
        .select()
        .from(schema.workerApplications)
        .where(status ? eq(schema.workerApplications.status, status as any) : undefined)
        .orderBy(desc(schema.workerApplications.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await getDb()
        .select({ count: sql<number>`count(*)` })
        .from(schema.workerApplications);

      return {
        applications: rows.map(r => ({
          ...r,
          skills: typeof r.skills === "string" ? JSON.parse(r.skills) : r.skills ?? [],
          paymentMethods: typeof r.paymentMethods === "string" ? JSON.parse(r.paymentMethods) : r.paymentMethods ?? [],
        })),
        total: countResult[0]?.count || 0,
      };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const appRows = await getDb()
        .select()
        .from(schema.workerApplications)
        .where(eq(schema.workerApplications.id, input.id))
        .limit(1);

      const application = appRows.at(0);
      if (!application) return null;

      const portfolioRows = await getDb()
        .select()
        .from(schema.workerPortfolios)
        .where(eq(schema.workerPortfolios.workerId, input.id));

      return {
        ...application,
        skills: typeof application.skills === "string" ? JSON.parse(application.skills) : application.skills ?? [],
        paymentMethods: typeof application.paymentMethods === "string" ? JSON.parse(application.paymentMethods) : application.paymentMethods ?? [],
        portfolios: portfolioRows.map(p => ({
          ...p,
          portfolioFiles: typeof p.portfolioFiles === "string" ? JSON.parse(p.portfolioFiles) : p.portfolioFiles ?? [],
          softwareTools: typeof p.softwareTools === "string" ? JSON.parse(p.softwareTools) : p.softwareTools ?? [],
        })),
      };
    }),

  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected"]),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await getDb()
        .update(schema.workerApplications)
        .set({
          status: input.status,
          adminNotes: input.adminNotes,
          updatedAt: new Date(),
        })
        .where(eq(schema.workerApplications.id, input.id));

      await getDb().insert(schema.activityLogs).values({
        entityType: "worker",
        entityId: input.id,
        action: `Application ${input.status}`,
        performedBy: null,
        details: { status: input.status },
      });

      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // Delete portfolios first (foreign key)
      await getDb()
        .delete(schema.workerPortfolios)
        .where(eq(schema.workerPortfolios.workerId, input.id));

      // Delete the application
      await getDb()
        .delete(schema.workerApplications)
        .where(eq(schema.workerApplications.id, input.id));

      await getDb().insert(schema.activityLogs).values({
        entityType: "worker",
        entityId: input.id,
        action: "Worker application deleted",
        performedBy: null,
        details: {},
      });

      return { success: true };
    }),
});
