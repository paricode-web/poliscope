import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
    console.log("UPLOAD ROUTE HIT");
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی ندارید." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "فایلی ارسال نشد." }, { status: 400 });
    }

    const ext = TYPES[file.type];

    if (!ext) {
      return NextResponse.json(
        { error: "فرمت تصویر مجاز نیست." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "حجم تصویر بیش از ۵ مگابایت است." },
        { status: 400 },
      );
    }

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });

    const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

    await writeFile(
      path.join(dir, name),
      Buffer.from(await file.arrayBuffer()),
    );

    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (error) {
    console.error("IMAGE_UPLOAD_ERROR:", error);

    return NextResponse.json(
      { error: "خطای داخلی هنگام آپلود تصویر." },
      { status: 500 },
    );
  }
}