import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';
import { parse as parseYaml } from 'yaml';

export const PILLAR_SLUGS = ['training', 'races-news', 'gear'] as const;

/** Articles: /<pillar>/<slug>/. The entry id (file name) is the slug. */
const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    pillar: z.enum(PILLAR_SLUGS),
    tags: z.array(z.string()).default([]),
    author: z.string(),
    publishDate: z.coerce.date(),
    heroImage: z.string().optional(),
    heroAlt: z.string(),
    /** The short version: exactly three bullets. */
    summary: z.array(z.string()).length(3),
    /** Slug of the next article in the same pillar (the "Next in <pillar>" banner). */
    next: reference('articles').optional(),
    /** Slug for the inline Read Next card in the body. Falls back to `next`. */
    readNext: reference('articles').optional(),
    draft: z.boolean().default(false),
  }),
});

/** Station guides: /stations/<slug>/, one per HYROX station, in course order. */
const stations = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/stations' }),
  schema: z.object({
    title: z.string(),
    order: z.number().int().min(1).max(8),
    /** Distance or other short label shown on the grid card, e.g. "1,000 m". */
    metric: z.string(),
    dek: z.string(),
    draft: z.boolean().default(false),
  }),
});

/** Start Here: the three articles a first-timer reads, in order. */
const startHere = defineCollection({
  loader: file('./src/data/start-here.json'),
  schema: z.object({
    order: z.number().int(),
    title: z.string(),
    dek: z.string(),
    article: reference('articles'),
  }),
});

/**
 * Race calendar for the next-race strip, maintained by hand in src/data/races.yaml.
 * Entries need no id; one is derived from city and start date.
 */
const races = defineCollection({
  loader: file('./src/data/races.yaml', {
    parser: (text) =>
      (parseYaml(text) as Record<string, unknown>[]).map((race) => ({
        ...race,
        id: `${race.city}-${race.start}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      })),
  }),
  schema: z
    .object({
      city: z.string().min(1),
      start: z.coerce.date(),
      end: z.coerce.date(),
    })
    .refine((r) => r.end >= r.start, { message: 'end must be on or after start' }),
});

export const collections = { articles, stations, startHere, races };
