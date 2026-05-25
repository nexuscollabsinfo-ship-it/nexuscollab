import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  int,
  json,
  bigint,
  boolean,
} from "drizzle-orm/mysql-core";

// ─── Users (auth system — extended from base) ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  countryCode: varchar("countryCode", { length: 10 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "banned"]).default("active"),
  emailVerified: boolean("emailVerified").default(false),
  phoneVerified: boolean("phoneVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Local Auth Tokens (for email/password + OTP JWT) ───
export const localTokens = mysqlTable("local_tokens", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  token: varchar("token", { length: 500 }).notNull(),
  type: mysqlEnum("type", ["auth", "reset"]).default("auth").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── OTP Codes ───
export const otpCodes = mysqlTable("otp_codes", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 50 }).notNull(),
  countryCode: varchar("countryCode", { length: 10 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Client Requests ───
export const clientRequests = mysqlTable("client_requests", {
  id: serial("id").primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  discordUsername: varchar("discordUsername", { length: 100 }),
  instagramUsername: varchar("instagramUsername", { length: 100 }),
  country: varchar("country", { length: 100 }).notNull(),
  leadSource: varchar("leadSource", { length: 50 }).notNull(),
  serviceNeeded: varchar("serviceNeeded", { length: 255 }).notNull(),
  projectDetails: text("projectDetails").notNull(),
  budgetRange: varchar("budgetRange", { length: 100 }).notNull(),
  deadline: varchar("deadline", { length: 100 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 100 }).notNull(),
  referenceFiles: json("referenceFiles").$type<string[]>(),
  status: mysqlEnum("status", ["pending", "reviewing", "assigned", "in_progress", "completed", "cancelled"]).default("pending"),
  adminNotes: text("adminNotes"),
  assignedWorkerId: bigint("assignedWorkerId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Worker Applications ───
export const workerApplications = mysqlTable("worker_applications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  discordUsername: varchar("discordUsername", { length: 100 }),
  instagramUsername: varchar("instagramUsername", { length: 100 }),
  country: varchar("country", { length: 100 }).notNull(),
  workType: mysqlEnum("workType", ["part_time", "full_time"]).notNull(),
  skills: json("skills").$type<string[]>().notNull(),
  minPrice: decimal("minPrice", { precision: 10, scale: 2 }).notNull(),
  maxPrice: decimal("maxPrice", { precision: 10, scale: 2 }).notNull(),
  deliveryTime: varchar("deliveryTime", { length: 100 }).notNull(),
  paymentMethods: json("paymentMethods").$type<string[]>().notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Worker Portfolios (dynamic skill sections) ───
export const workerPortfolios = mysqlTable("worker_portfolios", {
  id: serial("id").primaryKey(),
  workerId: bigint("workerId", { mode: "number", unsigned: true }).notNull(),
  skillName: varchar("skillName", { length: 255 }).notNull(),
  portfolioFiles: json("portfolioFiles").$type<string[]>(),
  softwareTools: json("softwareTools").$type<string[]>(),
  experienceDetails: text("experienceDetails"),
  yearsOfExperience: int("yearsOfExperience"),
  skillLevel: mysqlEnum("skillLevel", ["beginner", "intermediate", "advanced", "expert"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Projects ───
export const projects = mysqlTable("projects", {
  id: serial("id").primaryKey(),
  clientRequestId: bigint("clientRequestId", { mode: "number", unsigned: true }).notNull(),
  assignedWorkerId: bigint("assignedWorkerId", { mode: "number", unsigned: true }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["pending", "assigned", "in_progress", "review", "delivered", "completed", "cancelled"]).default("pending"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  startDate: timestamp("startDate"),
  deadline: timestamp("deadline"),
  completionDate: timestamp("completionDate"),
  internalNotes: text("internalNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Activity Logs ───
export const activityLogs = mysqlTable("activity_logs", {
  id: serial("id").primaryKey(),
  entityType: mysqlEnum("entityType", ["client", "worker", "project", "user"]).notNull(),
  entityId: bigint("entityId", { mode: "number", unsigned: true }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  performedBy: bigint("performedBy", { mode: "number", unsigned: true }),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Uploaded Files ───
export const uploadedFiles = mysqlTable("uploaded_files", {
  id: serial("id").primaryKey(),
  entityType: mysqlEnum("entityType", ["client_request", "worker_portfolio", "project_delivery"]).notNull(),
  entityId: bigint("entityId", { mode: "number", unsigned: true }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(),
  fileSize: int("fileSize").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
