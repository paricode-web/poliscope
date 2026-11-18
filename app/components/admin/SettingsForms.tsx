"use client";

import { useActionState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  changeAdminEmail,
  changeAdminPassword,
  type SettingsState,
} from "@/lib/actions/admin-settings";

const initial: SettingsState = { ok: false, message: "" };

const inputClass =
  "w-full rounded-lg border border-line bg-transparent px-3 py-2 text-base outline-none focus:border-ink-2";
const buttonClass =
  "rounded-lg bg-black px-5 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black";

function Message({ state }: { state: SettingsState }) {
  if (!state.message) return null;
  return (
    <p role="status" className={state.ok ? "text-green-700" : "text-red-700"}>
      {state.message}
    </p>
  );
}

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, action, pending] = useActionState(changeAdminEmail, initial);

  useEffect(() => {
    if (state.signOut) {
      const timer = setTimeout(() => signOut({ callbackUrl: "/login" }), 1500);
      return () => clearTimeout(timer);
    }
  }, [state.signOut]);

  return (
    <form action={action} className="space-y-4">
      <h2 className="text-xl font-bold">تغییر ایمیل</h2>
      <p className="text-sm text-ink-2">ایمیل فعلی: {currentEmail}</p>
      <input name="email" type="email" required placeholder="ایمیل جدید" className={inputClass} />
      <input
        name="currentPassword"
        type="password"
        required
        autoComplete="current-password"
        placeholder="رمز فعلی"
        className={inputClass}
      />
      <Message state={state} />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "در حال ذخیره..." : "ذخیره ایمیل"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changeAdminPassword, initial);

  return (
    <form action={action} className="space-y-4">
      <h2 className="text-xl font-bold">تغییر رمز عبور</h2>
      <input
        name="currentPassword"
        type="password"
        required
        autoComplete="current-password"
        placeholder="رمز فعلی"
        className={inputClass}
      />
      <input
        name="newPassword"
        type="password"
        required
        minLength={12}
        autoComplete="new-password"
        placeholder="رمز جدید (حداقل ۱۲ کاراکتر)"
        className={inputClass}
      />
      <input
        name="confirmPassword"
        type="password"
        required
        autoComplete="new-password"
        placeholder="تکرار رمز جدید"
        className={inputClass}
      />
      <Message state={state} />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "در حال ذخیره..." : "ذخیره رمز"}
      </button>
    </form>
  );
}