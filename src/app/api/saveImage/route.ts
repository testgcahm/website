import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;  // ✅ Explicitly cast to File

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = path.join(process.cwd(), "public/images");

        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, file.name); // ✅ File now has a `name`
        await fs.writeFile(filePath, buffer);

        return NextResponse.json({ imagePath: `/images/${file.name}` });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
