import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const { name, yearId } = await request.json();

    if (!name || !yearId) {
      return NextResponse.json(
        { error: "Name and Year ID are required" },
        { status: 400 }
      );
    }

    const unit = await prisma.unit.create({
      data: { name, yearId },
    });

    return NextResponse.json(unit);
  } catch (error) {
    console.error("Create unit error:", error);
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

    // Attempt delete
     await prisma.unit.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete unit error:", error);
     if (error.code === 'P2003') {
        return NextResponse.json(
            { error: "Cannot delete Unit because it has resources/assignments. Delete them first." },
            { status: 400 }
        );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
