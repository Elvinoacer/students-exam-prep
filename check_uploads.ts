import "dotenv/config";
import { prisma } from "./app/lib/db";

async function main() {
  console.log("--- Latest Resources ---");
  const resources = await prisma.resource.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });
  if (resources.length === 0) console.log("No resources found.");
  else resources.forEach(r => console.log(`[${r.fileType}] ${r.title}: ${r.fileUrl}`));

  console.log("\n--- Exam Timetables ---");
  const timetables = await prisma.examTimetable.findMany({
    take: 5,
    include: { year: true }
  });
  if (timetables.length === 0) console.log("No timetables found.");
  else timetables.forEach(t => console.log(`[${t.year.name}] ${t.imageUrl}`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
