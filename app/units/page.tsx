import { prisma } from "@/app/lib/db";
import { UnitsGrid } from "@/app/components/UnitsGrid";
import { DownloadAllButton } from "@/app/components/DownloadAllButton";

export const dynamic = "force-dynamic";

export default async function UnitsPage() {
  const years = await prisma.year.findMany({
    include: {
      timetable: true,
      units: {
        include: {
          _count: {
            select: { resources: true, assignments: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen container mx-auto px-4 sm:px-6 pt-24 pb-12">
      <div className="container mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">Browse Units</h1>
            <p className="text-muted text-lg max-w-2xl">
              Select a unit to view resources, assignments, and past papers.
            </p>
          </div>
          <DownloadAllButton />
        </header>

        {/* Pass data to Client Component for Search/Filter */}
        <UnitsGrid years={years} />
      </div>
    </main>
  );
}
