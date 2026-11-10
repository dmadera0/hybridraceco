import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';

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
    /** Slug of the next article in the same pillar. */
    next: reference('articles').optional(),
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

export const collections = { articles, stations, startHere };
