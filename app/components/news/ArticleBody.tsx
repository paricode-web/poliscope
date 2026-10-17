/** متن ساده را به پاراگراف تبدیل می‌کند؛ HTML خام رندر نمی‌شود، پس خطر XSS ندارد. */
export function ArticleBody({ body }: { body: string }) {
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className="space-y-6 text-lg leading-10">
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  );
}
