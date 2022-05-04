import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "hello@dipankarmaikap.com";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("notsecurepassword", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.log.create({
    data: {
      datetime: "2022-05-04T00:00:00.000Z",
      end_datetime: "2022-05-05T00:00:00.000Z",
      description: "My first log",
      userId: user.id,
    },
  });
  await prisma.log.create({
    data: {
      datetime: "2022-03-04T00:00:00.000Z",
      end_datetime: "2022-08-05T00:00:00.000Z",
      description: "My second log",
      userId: user.id,
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
