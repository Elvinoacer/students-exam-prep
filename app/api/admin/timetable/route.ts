import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function getPublicIdFromUrl(url: string) {
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex !== -1) {
      // Public ID is everything between the version (v...) and the file extension
      const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
      return publicIdWithExt.split(".")[0];
    }
    return null;
  } catch (e) {
    return null;
  }
}

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

    // Clean up old image if replacing
    const existing = await prisma.examTimetable.findUnique({
      where: { yearId },
    });

    if (existing) {
      const oldPublicId = getPublicIdFromUrl(existing.imageUrl);
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId);
      }
    }

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

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const timetable = await prisma.examTimetable.findUnique({
      where: { id },
    });

    if (!timetable) {
      return NextResponse.json({ error: "Timetable not found" }, { status: 404 });
    }

    // Extract and delete from Cloudinary
    const publicId = getPublicIdFromUrl(timetable.imageUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete from DB
    await prisma.examTimetable.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    console.error("Delete timetable error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
