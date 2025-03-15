import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { type, index, filename } = await req.json();

    if (!type) {
      return NextResponse.json({ error: "Type is required (text or image)" }, { status: 400 });
    }

    let filePath = "";

    if (type === "text") {
      filePath = path.join(process.cwd(), "public/text/text.json");

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "Text file not found" }, { status: 404 });
      }

      // Read existing text data
      const textData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      if (!Array.isArray(textData)) {
        return NextResponse.json({ error: "Invalid text format" }, { status: 500 });
      }

      if (index < 0 || index >= textData.length) {
        return NextResponse.json({ error: "Invalid text index" }, { status: 400 });
      }

      // Remove the specified text entry
      textData.splice(index, 1);

      // Write back updated text data
      fs.writeFileSync(filePath, JSON.stringify(textData, null, 2), "utf-8");

      return NextResponse.json({ message: "Text entry deleted successfully!" });
    } 
    
    else if (type === "image" && filename) {
      filePath = path.join(process.cwd(), "public/images", filename);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }

      fs.unlinkSync(filePath);
      return NextResponse.json({ message: "Image deleted successfully!" });
    } 
    
    else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Failed to delete file." }, { status: 500 });
  }
}
