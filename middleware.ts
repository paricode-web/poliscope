// proxy.ts  (در ریشهٔ پروژه، کنار app)
import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const locales = ["fa", "en"]; // locale های واقعی پروژه
const defaultLocale = "fa";

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;

    const hasLocale = locales.some(
      (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
    );

    if (!hasLocale) {
      const url = req.nextUrl.clone();
      url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // locale را از ابتدای مسیر حذف کن
        const path = req.nextUrl.pathname.replace(/^\/(fa|en)(?=\/|$)/, "") || "/";

        if (path.startsWith("/admin")) return token?.role === "ADMIN";
        if (path.startsWith("/dashboard")) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};