import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@hms.com";
  const plainPassword = "123456";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "HMS Admin",
      email,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log("Seeded default user:");
  console.log({ id: user.id, email: user.email, role: user.role });
  console.log(`Login with: ${email} / ${plainPassword}`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
