import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;
export type Pillar = Article['data']['pillar'];

export const PILLARS: { slug: Pillar; label: string; dek: string }[] = [
  {
    slug: 'training',
    label: 'Training',
    dek: 'Running, strength and station work for hybrid racing, from a first block to race-specific sessions.',
  },
  {
    slug: 'races-news',
    label: 'Races & News',
    dek: 'Race formats, divisions, rules and what to expect on the day.',
  },
  {
    slug: 'gear',
    label: 'Gear',
    dek: 'Shoes, kit and equipment for racing and for training at home.',
  },
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

/** Long-form date for bylines, e.g. "3 November 2026". */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** ISO date for <time datetime>. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Related articles: same pillar or a shared tag, newest first, excluding the
 * article itself and any ids in `exclude`.
 */
export function relatedArticles(article: Article, all: Article[], exclude: string[] = [], count = 3): Article[] {
  const skip = new Set([article.id, ...exclude]);
  const tags = new Set(article.data.tags);
  return all
    .filter((a) => !skip.has(a.id))
    .filter((a) => a.data.pillar === article.data.pillar || a.data.tags.some((t) => tags.has(t)))
    .sort(byNewest)
    .slice(0, count);
}

/**
 * Split rendered body HTML so the Read Next card lands after the second section
 * (before the third h2). Returns the whole body as `before` when there are fewer sections.
 */
export function splitForReadNext(html: string): { before: string; after: string } {
  const matches = [...html.matchAll(/<h2[\s>]/g)];
  const third = matches[2];
  if (!third || third.index === undefined) return { before: html, after: '' };
  return { before: html.slice(0, third.index), after: html.slice(third.index) };
}
