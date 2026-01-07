import { prisma } from "@/app/lib/db";
import { ManageTimetableForm } from "@/app/components/ManageTimetableForm";

export default async function AdminTimetablePage() {
  const years = await prisma.year.findMany({
    include: { timetable: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="container mx-auto space-y-8 max-w-5xl">
        <header className="flex justify-between items-center border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Timetables</h1>
            <p className="text-muted">Upload exam timetables for each year.</p>
          </div>
          <a href="/admin" className="text-sm font-medium hover:underline text-primary">
            ← Back to Dashboard
          </a>
        </header>

        <ManageTimetableForm years={years} />
      </div>
    </main>
  );
}
