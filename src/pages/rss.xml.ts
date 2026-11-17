import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { articlePath, getPublishedArticles, pillarLabel } from '../lib/articles';
import { SITE_DESCRIPTION, SITE_NAME, isPlaceholder } from '../lib/site';

/** RSS feed of all published articles, newest first. */
export async function GET(context: APIContext) {
  const articles = await getPublishedArticles();
  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site!,
    trailingSlash: true,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.dek,
      pubDate: article.data.publishDate,
      link: articlePath(article),
      categories: [pillarLabel(article.data.pillar), ...article.data.tags],
      ...(isPlaceholder(article.data.author) ? {} : { author: article.data.author }),
    })),
    customData: '<language>en-gb</language>',
  });
}
