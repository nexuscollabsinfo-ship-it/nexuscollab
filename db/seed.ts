import { getDb } from "../api/queries/connection";
import * as schema from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const ADMIN_EMAILS = [
  { email: "nexuscollabs.info@gmail.com", name: "Nexus Admin" },
  { email: "pathakakarsh02@gmail.com", name: "Akarsh Pathak" },
];

async function seed() {
  console.log("Seeding admin accounts...");
  const db = getDb();

  for (const admin of ADMIN_EMAILS) {
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, admin.email))
      .limit(1);

    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash("NexusAdmin2024!", 12);
      await db.insert(schema.users).values({
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        role: "admin",
        status: "active",
        emailVerified: true,
        unionId: `admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        lastSignInAt: new Date(),
      });
      console.log(`  Created admin: ${admin.email}`);
    } else {
      await db
        .update(schema.users)
        .set({ role: "admin", status: "active" })
        .where(eq(schema.users.email, admin.email));
      console.log(`  Updated admin: ${admin.email}`);
    }
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
