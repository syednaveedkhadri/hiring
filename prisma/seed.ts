import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const positions = [
  {
    title: "System Administrator",
    department: "IT",
    vacancies: 3,
  },
  {
    title: "CCTV Technician",
    department: "Technical",
    vacancies: 5,
  },
  {
    title: "Electrician",
    department: "Technical",
    vacancies: 5,
    preferredRequirements:
      "Experience working with smart-home products and smart-home installations.",
  },
  {
    title: "AC Technician",
    department: "Technical",
    vacancies: 2,
  },
  {
    title: "Driver",
    department: "Operations",
    vacancies: 10,
  },
  {
    title: "Shopify Developer",
    department: "IT",
    vacancies: 2,
  },
  {
    title: "Odoo Developer",
    department: "IT",
    vacancies: 2,
    seniorityLevel: "1 Senior / 1 Junior",
  },
  {
    title: "Digital Marketing",
    department: "Marketing",
    vacancies: 2,
  },
  {
    title: "SEO",
    department: "Marketing",
    vacancies: 2,
  },
  {
    title: "Backend Developer",
    department: "IT",
    vacancies: 2,
    seniorityLevel: "1 Senior / 1 Junior",
  },
];

async function main() {
  console.log("Starting database seed...");

  for (const position of positions) {
    const existingPosition = await prisma.position.findFirst({
      where: {
        title: position.title,
      },
    });

    if (existingPosition) {
      await prisma.position.update({
        where: {
          id: existingPosition.id,
        },
        data: position,
      });

      console.log(`Updated: ${position.title}`);
    } else {
      await prisma.position.create({
        data: position,
      });

      console.log(`Created: ${position.title}`);
    }
  }

  console.log("Database seed completed.");
}

main()
  .catch((error) => {
    console.error("Database seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });