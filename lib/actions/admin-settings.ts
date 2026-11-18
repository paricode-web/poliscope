"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export interface SettingsState {
  ok: boolean;
  message: string;
  signOut?: boolean;
}

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email("ایمیل معتبر نیست"),
  currentPassword: z.string().min(1, "رمز فعلی را وارد کنید"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "رمز فعلی را وارد کنید"),
    newPassword: z.string().min(12, "رمز جدید باید حداقل ۱۲ کاراکتر باشد"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "تکرار رمز با رمز جدید یکی نیست",
    path: ["confirmPassword"],
  });

async function getCurrentAdmin() {
  const session = await requireAdmin();
  const email = session.user?.email;
  if (!email) return null;
  return prisma.user.findUnique({ where: { email } });
}

export async function changeAdminEmail(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, message: "کاربر پیدا نشد" };

  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, admin.password);
  if (!valid) return { ok: false, message: "رمز فعلی اشتباه است" };

  const taken = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (taken && taken.id !== admin.id) {
    return { ok: false, message: "این ایمیل قبلاً استفاده شده است" };
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: { email: parsed.data.email },
  });

  return {
    ok: true,
    message: "ایمیل تغییر کرد. لطفاً دوباره وارد شوید.",
    signOut: true,
  };
}

export async function changeAdminPassword(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, message: "کاربر پیدا نشد" };

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, admin.password);
  if (!valid) return { ok: false, message: "رمز فعلی اشتباه است" };

  const hashed = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: admin.id },
    data: { password: hashed },
  });

  return { ok: true, message: "رمز با موفقیت تغییر کرد." };
}