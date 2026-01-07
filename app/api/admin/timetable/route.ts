import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, // Usually safe to use public var if convenient, or use private var
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,        // Same
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const yearId = formData.get("yearId") as string;
    const file = formData.get("file") as File;

    if (!yearId || !file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert file to buffer for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary via Promise wrapper
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "exam_timetables",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const imageUrl = result.secure_url;

    // Upsert the timetable in DB
    const timetable = await prisma.examTimetable.upsert({
      where: { yearId: yearId },
      update: { imageUrl },
      create: { yearId, imageUrl },
    });

    return NextResponse.json(timetable);
  } catch (error: any) {
    console.error("Upload timetable error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
