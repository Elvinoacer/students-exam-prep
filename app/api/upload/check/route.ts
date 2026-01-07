import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { filename } = await request.json();
    if (!filename) return NextResponse.json({ error: "Filename required" }, { status: 400 });

    // List blobs that start with the filename to find a match
    // Note: This is an approximation. Ideally we'd match exact names, but 'list' uses prefix.
    const { blobs } = await list({ prefix: filename, limit: 1 });

    // Check strict equality to be safe, or just take the first match if we assume unique prefixes
    const existing = blobs.find(b => b.pathname === filename);

    if (existing) {
      return NextResponse.json({ exists: true, url: existing.url });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
