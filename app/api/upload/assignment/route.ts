import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const unitId = formData.get("unitId") as string;
    const notes = formData.get("notes") as string;
    const fileUrl = formData.get("fileUrl") as string;

    if (!title || !unitId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save to DB
    const assignment = await prisma.assignment.create({
      data: {
        title,
        unitId,
        notes: notes || null,
        fileUrl: fileUrl || null,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Create assignment error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
