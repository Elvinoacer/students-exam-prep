import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create Years
  const year1 = await prisma.year.upsert({
    where: { name: "Year 1" },
    update: {},
    create: { name: "Year 1" },
  });

  const year2 = await prisma.year.upsert({
    where: { name: "Year 2" },
    update: {},
    create: { name: "Year 2" },
  });

  const year3 = await prisma.year.upsert({
    where: { name: "Year 3" },
    update: {},
    create: { name: "Year 3" },
  });

  console.log("✅ Years created");

  // Create Units for Year 1
  const unit1_1 = await prisma.unit.upsert({
    where: { id: "unit-intro-programming" },
    update: {},
    create: {
      id: "unit-intro-programming",
      name: "Introduction to Programming",
      yearId: year1.id,
    },
  });

  const unit1_2 = await prisma.unit.upsert({
    where: { id: "unit-computer-systems" },
    update: {},
    create: {
      id: "unit-computer-systems",
      name: "Computer Systems",
      yearId: year1.id,
    },
  });

  // Create Units for Year 2
  const unit2_1 = await prisma.unit.upsert({
    where: { id: "unit-data-structures" },
    update: {},
    create: {
      id: "unit-data-structures",
      name: "Data Structures & Algorithms",
      yearId: year2.id,
    },
  });

  const unit2_2 = await prisma.unit.upsert({
    where: { id: "unit-databases" },
    update: {},
    create: {
      id: "unit-databases",
      name: "Database Systems",
      yearId: year2.id,
    },
  });

  // Create Units for Year 3
  const unit3_1 = await prisma.unit.upsert({
    where: { id: "unit-software-engineering" },
    update: {},
    create: {
      id: "unit-software-engineering",
      name: "Software Engineering",
      yearId: year3.id,
    },
  });

  console.log("✅ Units created");

  // Create sample resources for "Introduction to Programming"
  await prisma.resource.upsert({
    where: { id: "res-intro-notes" },
    update: {},
    create: {
      id: "res-intro-notes",
      unitId: unit1_1.id,
      title: "Introduction to Python - Lecture Notes",
      fileUrl: "https://example.com/python-intro.pdf",
      fileType: "pdf",
      uploadedBy: "GTSS",
      isOfficial: true,
    },
  });

  await prisma.resource.upsert({
    where: { id: "res-python-tutorial" },
    update: {},
    create: {
      id: "res-python-tutorial",
      unitId: unit1_1.id,
      title: "Python Basics Tutorial",
      fileUrl: "https://www.youtube.com/watch?v=example",
      fileType: "youtube",
      uploadedBy: "John Doe",
      isOfficial: false,
    },
  });

  console.log("✅ Resources created");

  // Create sample assignment
  const assignment1 = await prisma.assignment.upsert({
    where: { id: "assignment-1" },
    update: {},
    create: {
      id: "assignment-1",
      unitId: unit1_1.id,
      title: "Assignment 1: Variables and Data Types",
      fileUrl: "https://example.com/assignment1.pdf",
      notes: "Due date: Week 4\n\nTopics covered:\n- Variables\n- Data types\n- Basic I/O",
    },
  });

  // Create sample solutions
  await prisma.assignmentSolution.upsert({
    where: { id: "solution-1-official" },
    update: {},
    create: {
      id: "solution-1-official",
      assignmentId: assignment1.id,
      fileUrl: "https://example.com/solution1-official.pdf",
      uploadedBy: "GTSS",
      isOfficial: true,
    },
  });

  await prisma.assignmentSolution.upsert({
    where: { id: "solution-1-student" },
    update: {},
    create: {
      id: "solution-1-student",
      assignmentId: assignment1.id,
      fileUrl: "https://example.com/solution1-jane.pdf",
      uploadedBy: "Jane Smith",
      isOfficial: false,
    },
  });

  console.log("✅ Assignments and solutions created");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
