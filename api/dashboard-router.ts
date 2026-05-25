import { z } from "zod";
import { desc, sql, eq } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

export const dashboardRouter = createRouter({
  stats: publicQuery.query(async () => {
    const clientCount = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.clientRequests);

    const workerCount = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.workerApplications);

    const projectCount = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.projects);

    const pendingRequests = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.clientRequests)
      .where(eq(schema.clientRequests.status, "pending"));

    const activeProjects = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.projects)
      .where(sql`status IN ('assigned', 'in_progress', 'review')`);

    const completedProjects = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.projects)
      .where(eq(schema.projects.status, "completed"));

    const approvedWorkers = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.workerApplications)
      .where(eq(schema.workerApplications.status, "approved"));

    return {
      totalClients: clientCount[0]?.count || 0,
      totalWorkers: workerCount[0]?.count || 0,
      totalProjects: projectCount[0]?.count || 0,
      pendingRequests: pendingRequests[0]?.count || 0,
      activeProjects: activeProjects[0]?.count || 0,
      completedProjects: completedProjects[0]?.count || 0,
      approvedWorkers: approvedWorkers[0]?.count || 0,
    };
  }),

  recentActivity: publicQuery
    .input(z.object({ limit: z.number().default(20) }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit || 20;
      return getDb()
        .select()
        .from(schema.activityLogs)
        .orderBy(desc(schema.activityLogs.createdAt))
        .limit(limit);
    }),

  workerStats: publicQuery.query(async () => {
    const allWorkers = await getDb().select().from(schema.workerApplications);

    const skillCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};

    for (const worker of allWorkers) {
      const skills = worker.skills as string[] || [];
      for (const skill of skills) {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      }
      if (worker.country) {
        countryCounts[worker.country] = (countryCounts[worker.country] || 0) + 1;
      }
    }

    return {
      skills: Object.entries(skillCounts)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
      countries: Object.entries(countryCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
    };
  }),
});
