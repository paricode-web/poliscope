import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations/newsletter";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "درخواست نامعتبر است." },
      { status: 422 },
    );
  }

  await prisma.subscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email },
  });

  return NextResponse.json({ message: "عضویت شما در خبرنامه ثبت شد." }, { status: 201 });
}
