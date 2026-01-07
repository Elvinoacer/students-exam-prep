
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET() {
  try {
    const years = await prisma.year.findMany({
      include: { units: true },
    });
    
    return NextResponse.json({
        count: years.length,
        years: years.map(y => ({
            name: y.name,
            unitCount: y.units.length,
            units: y.units.map(u => u.name)
        }))
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
