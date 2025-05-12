import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error("ADMIN_PASSWORD environment variable is not set");
    }

    const hashedPassword = await hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
      where: {
        email: "admin@szark.org",
      },
      update: {
        password: hashedPassword,
      },
      create: {
        email: "admin@szark.org",
        name: "Admin",
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log("Admin user created/updated successfully:", admin.email);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
