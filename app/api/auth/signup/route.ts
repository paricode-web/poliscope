import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "درخواست نامعتبر است." },
        { status: 400 },
      );
    }

    const { name, email, password } = body as Record<string, unknown>;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        { message: "همه فیلدها الزامی هستند." },
        { status: 400 },
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 254) {
      return NextResponse.json(
        { message: "ایمیل معتبر نیست." },
        { status: 400 },
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { message: "نام خیلی طولانی است." },
        { status: 400 },
      );
    }

    if (password.length < 8 || password.length > 72) {
      return NextResponse.json(
        { message: "رمز عبور باید بین ۸ تا ۷۲ کاراکتر باشد." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "این ایمیل قبلاً ثبت شده است." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // نقش را عمداً نمی‌دهیم؛ باید در schema پریزما default(USER) باشد
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "ثبت نام موفق بود.",
        user: { id: user.id, email: user.email },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json({ message: "خطای سرور." }, { status: 500 });
  }
}