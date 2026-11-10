import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;
export type Pillar = Article['data']['pillar'];

export const PILLARS: { slug: Pillar; label: string }[] = [
  { slug: 'training', label: 'Training' },
  { slug: 'races-news', label: 'Races & News' },
  { slug: 'gear', label: 'Gear' },
];

export function pillarLabel(slug: Pillar): string {
  return PILLARS.find((p) => p.slug === slug)?.label ?? slug;
}

export function pillarPath(slug: Pillar): string {
  return `/${slug}/`;
}

export function articlePath(article: Article): string {
  return `/${article.data.pillar}/${article.id}/`;
}

/** Placeholder label shown until a real hero image exists. */
export function heroPlaceholder(article: Article): string {
  return `[PHOTO: ${article.data.heroAlt}]`;
}

const WORDS_PER_MINUTE = 225;

/** Read time in whole minutes, computed from the Markdown body. */
export function readTime(body: string | undefined): number {
  if (!body) return 1;
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~\[\]()!-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function byNewest(a: Article, b: Article): number {
  return b.data.publishDate.valueOf() - a.data.publishDate.valueOf();
}

/** All non-draft articles, newest first. */
export async function getPublishedArticles(): Promise<Article[]> {
  const all = await getCollection('articles', ({ data }) => !data.draft);
  return all.sort(byNewest);
}
