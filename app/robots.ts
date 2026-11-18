import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // مسیرهای هر دو زبان (/search و /en/search و ...) و پنل مدیریت.
      disallow: ["/api/", "/search", "/*/search", "/admin", "/*/admin"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}