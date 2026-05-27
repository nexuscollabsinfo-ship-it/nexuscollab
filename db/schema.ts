import {
  pgTable,
  bigint,
  integer,
  varchar,
  text,
  timestamp,
  numeric,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

// ─── Users ───────────────────────────────────────────────────────
export const users = pgTable("users", {
  id:             bigint("id", { mode: "number" }).primaryKey(),
  unionId:        varchar("unionid", { length: 255 }),
  name:           varchar("name", { length: 255 }),
  email:          varchar("email", { length: 320 }),
  password:       varchar("password", { length: 255 }),
  phone:          varchar("phone", { length: 50 }),
  countryCode:    varchar("countrycode", { length: 10 }),
  avatar:         text("avatar"),
  role:           varchar("role", { length: 10 }).default("user").notNull(),
  status:         varchar("status", { length: 10 }).default("active"),
  emailVerified:  boolean("emailverified").default(false),
  phoneVerified:  boolean("phoneverified").default(false),
  createdAt:      timestamp("createdat").defaultNow().notNull(),
  updatedAt:      timestamp("updatedat").defaultNow().notNull(),
  lastSignInAt:   timestamp("lastsigninat").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Local Auth Tokens ───────────────────────────────────────────
export const localTokens = pgTable("local_tokens", {
  id:         bigint("id", { mode: "number" }).primaryKey(),
  userId:     bigint("userid", { mode: "number" }).notNull(),
  token:      varchar("token", { length: 500 }).notNull(),
  type:       varchar("type", { length: 10 }).default("auth").notNull(),
  expiresAt:  timestamp("expiresat").notNull(),
  createdAt:  timestamp("createdat").defaultNow().notNull(),
});

// ─── OTP Codes ───────────────────────────────────────────────────
export const otpCodes = pgTable("otp_codes", {
  id:           bigint("id", { mode: "number" }).primaryKey(),
  phone:        varchar("phone", { length: 50 }).notNull(),
  countryCode:  varchar("countrycode", { length: 10 }).notNull(),
  code:         varchar("code", { length: 10 }).notNull(),
  expiresAt:    timestamp("expiresat").notNull(),
  used:         boolean("used").default(false),
  createdAt:    timestamp("createdat").defaultNow().notNull(),
});

// ─── Client Requests ─────────────────────────────────────────────
export const clientRequests = pgTable("client_requests", {
  id:                 bigint("id", { mode: "number" }).primaryKey(),
  fullName:           varchar("fullname", { length: 255 }).notNull(),
  email:              varchar("email", { length: 255 }).notNull(),
  phone:              varchar("phone", { length: 50 }),
  discordUsername:    varchar("discordusername", { length: 100 }),
  instagramUsername:  varchar("instagramusername", { length: 100 }),
  country:            varchar("country", { length: 100 }).notNull(),
  leadSource:         varchar("leadsource", { length: 50 }).notNull(),
  serviceNeeded:      varchar("serviceneeded", { length: 255 }).notNull(),
  projectDetails:     text("projectdetails").notNull(),
  budgetRange:        varchar("budgetrange", { length: 100 }).notNull(),
  deadline:           varchar("deadline", { length: 100 }).notNull(),
  paymentMethod:      varchar("paymentmethod", { length: 100 }).notNull(),
  referenceFiles:     jsonb("referencefiles").$type<string[]>(),
  status:             varchar("status", { length: 20 }).default("pending"),
  adminNotes:         text("adminnotes"),
  assignedWorkerId:   bigint("assignedworkerid", { mode: "number" }),
  createdAt:          timestamp("createdat").defaultNow().notNull(),
  updatedAt:          timestamp("updatedat").defaultNow().notNull(),
});

// ─── Worker Applications ─────────────────────────────────────────
export const workerApplications = pgTable("worker_applications", {
  id:                 bigint("id", { mode: "number" }).primaryKey(),
  userId:             bigint("userid", { mode: "number" }),
  fullName:           varchar("fullname", { length: 255 }).notNull(),
  email:              varchar("email", { length: 255 }).notNull(),
  phone:              varchar("phone", { length: 50 }).notNull(),
  discordUsername:    varchar("discordusername", { length: 100 }),
  instagramUsername:  varchar("instagramusername", { length: 100 }),
  country:            varchar("country", { length: 100 }).notNull(),
  workType:           varchar("worktype", { length: 20 }).notNull(),
  skills:             jsonb("skills").$type<string[]>().notNull(),
  minPrice:           numeric("minprice", { precision: 10, scale: 2 }).notNull(),
  maxPrice:           numeric("maxprice", { precision: 10, scale: 2 }).notNull(),
  deliveryTime:       varchar("deliverytime", { length: 100 }).notNull(),
  paymentMethods:     jsonb("paymentmethods").$type<string[]>().notNull(),
  status:             varchar("status", { length: 20 }).default("pending"),
  adminNotes:         text("adminnotes"),
  createdAt:          timestamp("createdat").defaultNow().notNull(),
  updatedAt:          timestamp("updatedat").defaultNow().notNull(),
});

// ─── Worker Portfolios ───────────────────────────────────────────
export const workerPortfolios = pgTable("worker_portfolios", {
  id:                   bigint("id", { mode: "number" }).primaryKey(),
  workerId:             bigint("workerid", { mode: "number" }).notNull(),
  skillName:            varchar("skillname", { length: 255 }).notNull(),
  portfolioFiles:       jsonb("portfoliofiles").$type<string[]>(),
  softwareTools:        jsonb("softwaretools").$type<string[]>(),
  experienceDetails:    text("experiencedetails"),
  yearsOfExperience:    integer("yearsofexperience"),
  skillLevel:           varchar("skilllevel", { length: 20 }),
  createdAt:            timestamp("createdat").defaultNow().notNull(),
});

// ─── Projects ────────────────────────────────────────────────────
export const projects = pgTable("projects", {
  id:                 bigint("id", { mode: "number" }).primaryKey(),
  clientRequestId:    bigint("clientrequestid", { mode: "number" }).notNull(),
  assignedWorkerId:   bigint("assignedworkerid", { mode: "number" }),
  title:              varchar("title", { length: 255 }).notNull(),
  description:        text("description").notNull(),
  status:             varchar("status", { length: 20 }).default("pending"),
  priority:           varchar("priority", { length: 10 }).default("medium"),
  startDate:          timestamp("startdate"),
  deadline:           timestamp("deadline"),
  completionDate:     timestamp("completiondate"),
  internalNotes:      text("internalnotes"),
  createdAt:          timestamp("createdat").defaultNow().notNull(),
  updatedAt:          timestamp("updatedat").defaultNow().notNull(),
});

// ─── Activity Logs ───────────────────────────────────────────────
export const activityLogs = pgTable("activity_logs", {
  id:           bigint("id", { mode: "number" }).primaryKey(),
  entityType:   varchar("entitytype", { length: 20 }).notNull(),
  entityId:     bigint("entityid", { mode: "number" }).notNull(),
  action:       varchar("action", { length: 255 }).notNull(),
  performedBy:  bigint("performedby", { mode: "number" }),
  details:      jsonb("details"),
  createdAt:    timestamp("createdat").defaultNow().notNull(),
});

// ─── Uploaded Files ──────────────────────────────────────────────
export const uploadedFiles = pgTable("uploaded_files", {
  id:           bigint("id", { mode: "number" }).primaryKey(),
  entityType:   varchar("entitytype", { length: 30 }).notNull(),
  entityId:     bigint("entityid", { mode: "number" }).notNull(),
  fileUrl:      varchar("fileurl", { length: 500 }).notNull(),
  fileName:     varchar("filename", { length: 255 }).notNull(),
  fileType:     varchar("filetype", { length: 50 }).notNull(),
  fileSize:     integer("filesize").notNull(),
  createdAt:    timestamp("createdat").defaultNow().notNull(),
});
