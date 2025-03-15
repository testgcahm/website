import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const imageDir = path.join(process.cwd(), "public/images");

  try {
    const files = fs.readdirSync(imageDir);
    const imagePaths = files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file)) // Only include images
      .map((file) => `/images/${file}`); // Convert filenames to accessible URLs

    return NextResponse.json({ images: imagePaths }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to list images" }, { status: 500 });
  }
}
