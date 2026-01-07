import { prisma } from "@/app/lib/db";
import { StructureManager } from "@/app/components/StructureManager";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminStructurePage() {
  const years = await prisma.year.findMany({
    include: {
      units: {
        include: {
           _count: {
             select: { resources: true, assignments: true }
           }
        },
        orderBy: { name: "asc" }
      }
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="container mx-auto space-y-8 max-w-5xl">
        <header className="flex justify-between items-center border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Structure</h1>
             <p className="text-muted">Create Years and Units to organize content.</p>
          </div>
          <Link href="/admin" className="text-sm font-medium hover:underline text-primary">
            ← Back to Dashboard
          </Link>
        </header>

        <StructureManager years={years} />
      </div>
    </main>
  );
}
