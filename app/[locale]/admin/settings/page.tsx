import { setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/require-admin";
import { EmailForm, PasswordForm } from "@/app/components/admin/SettingsForms";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAdmin();

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-h3 font-extrabold">تنظیمات حساب ادمین</h1>
      <div className="grid max-w-3xl gap-12 md:grid-cols-2">
        <EmailForm currentEmail={session.user?.email ?? ""} />
        <PasswordForm />
      </div>
    </div>
  );
}