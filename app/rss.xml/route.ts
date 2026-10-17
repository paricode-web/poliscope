import { getLatestForFeed } from "@/lib/news";
import { absoluteUrl, articleHref, getCategory, siteConfig } from "@/lib/site";

export const revalidate = 600;

const XML_ESCAPES: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" };
const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (char) => XML_ESCAPES[char]);

export async function GET() {
  const articles = await getLatestForFeed(30);
  const items = articles
    .map((article) => {
      const link = absoluteUrl(articleHref(article));
      return `<item>
<title>${escapeXml(article.title)}</title>
<link>${escapeXml(link)}</link>
<guid isPermaLink="true">${escapeXml(link)}</guid>
<pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
<category>${escapeXml(getCategory(article.category).name)}</category>
<description>${escapeXml(article.summary)}</description>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(siteConfig.name)}</title>
<link>${escapeXml(absoluteUrl("/"))}</link>
<description>${escapeXml(siteConfig.description)}</description>
<language>fa</language>
<atom:link href="${escapeXml(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
