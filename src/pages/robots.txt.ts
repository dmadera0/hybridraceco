import type { APIContext } from 'astro';

/** robots.txt pointing crawlers at the sitemap index. */
export function GET(context: APIContext) {
  const sitemap = new URL('/sitemap-index.xml', context.site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
