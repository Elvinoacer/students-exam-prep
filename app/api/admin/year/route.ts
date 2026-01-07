import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const year = await prisma.year.create({
      data: { name },
    });

    return NextResponse.json(year);
  } catch (error) {
    console.error("Create year error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing ID" },
        { status: 400 }
      );
    }

    // Delete the year.
    // Note: If there are foreign key constraints (Units), this might fail unless cascading delete is enabled in Prisma
    // or we manually delete children.
    // For MVP, if it fails, the UI should show an error.
    // Ideally we should check for children first or use cascade.
    // Let's assume we want to be safe and maybe catch the constraint error.
    
    await prisma.year.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete year error:", error);
    if (error.code === 'P2003') { // Prisma foreign key constraint code
        return NextResponse.json(
            { error: "Cannot delete Year because it has existing Units. Please delete them first." },
            { status: 400 }
        );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
