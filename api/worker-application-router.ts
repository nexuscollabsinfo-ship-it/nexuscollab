import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb, insertReturningId } from "./queries/connection";
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
      const workerId = await insertReturningId(
        "worker_applications",
        ["fullname", "email", "phone", "discordusername", "instagramusername", "country",
         "worktype", "skills", "minprice", "maxprice", "deliverytime", "paymentmethods", "status"],
        [input.fullName, input.email, input.phone, input.discordUsername ?? null,
         input.instagramUsername ?? null, input.country, input.workType,
         JSON.stringify(input.skills), input.minPrice.toString(), input.maxPrice.toString(),
         input.deliveryTime, JSON.stringify(input.paymentMethods), "pending"]
      );

      if (input.portfolios && input.portfolios.length > 0) {
        for (const portfolio of input.portfolios) {
          await insertReturningId(
            "worker_portfolios",
            ["workerid", "skillname", "portfoliofiles", "softwaretools",
             "experiencedetails", "yearsofexperience", "skilllevel"],
            [workerId, portfolio.skillName,
             JSON.stringify(portfolio.portfolioFiles ?? []),
             JSON.stringify(portfolio.softwareTools ?? []),
             portfolio.experienceDetails ?? null,
             portfolio.yearsOfExperience ?? null,
             portfolio.skillLevel ?? null]
          );
        }
      }

      await insertReturningId(
        "activity_logs",
        ["entitytype", "entityid", "action", "performedby", "details"],
        ["worker", workerId, "New worker application submitted", null,
         JSON.stringify({ skills: input.skills, workType: input.workType })]
      );

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
          skills: Array.isArray(r.skills) ? r.skills : [],
          paymentMethods: Array.isArray(r.paymentMethods) ? r.paymentMethods : [],
        })),
        total: Number(countResult[0]?.count) || 0,
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
        skills: Array.isArray(application.skills) ? application.skills : [],
        paymentMethods: Array.isArray(application.paymentMethods) ? application.paymentMethods : [],
        portfolios: portfolioRows.map(p => ({
          ...p,
          portfolioFiles: Array.isArray(p.portfolioFiles) ? p.portfolioFiles : [],
          softwareTools: Array.isArray(p.softwareTools) ? p.softwareTools : [],
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
        .set({ status: input.status, adminNotes: input.adminNotes, updatedAt: new Date() })
        .where(eq(schema.workerApplications.id, input.id));

      await insertReturningId(
        "activity_logs",
        ["entitytype", "entityid", "action", "performedby", "details"],
        ["worker", input.id, `Application ${input.status}`, null,
         JSON.stringify({ status: input.status })]
      );

      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .delete(schema.workerPortfolios)
        .where(eq(schema.workerPortfolios.workerId, input.id));

      await getDb()
        .delete(schema.workerApplications)
        .where(eq(schema.workerApplications.id, input.id));

      await insertReturningId(
        "activity_logs",
        ["entitytype", "entityid", "action", "performedby", "details"],
        ["worker", input.id, "Worker application deleted", null, JSON.stringify({})]
      );

      return { success: true };
    }),
});
