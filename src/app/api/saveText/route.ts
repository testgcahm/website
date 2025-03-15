import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { text, font, color, style, fontSize, textAlign } = await req.json();

    if (!text.trim()) {
      return NextResponse.json({ error: "Text cannot be empty" }, { status: 400 });
    }

    // Ensure uploads directory exists
    const dir = path.join(process.cwd(), "public/text");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Define file path
    const filePath = path.join(dir, "text.json");

    // Read existing data if file exists
    let existingData: any[] = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      try {
        existingData = JSON.parse(fileContent);
        if (!Array.isArray(existingData)) {
          existingData = []; // Reset if data is not an array
        }
      } catch {
        existingData = []; // Reset if JSON parsing fails
      }
    }

    // Append new entry
    const newEntry = { text, font, color, style, fontSize, textAlign, timestamp: new Date().toISOString() };
    existingData.push(newEntry);

    // Save updated data
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    return NextResponse.json({ message: "Text saved successfully!", filePath });
  } catch (error) {
    console.error("Error saving text:", error);
    return NextResponse.json({ error: "Failed to save text." }, { status: 500 });
  }
}
