import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const logs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/logs' }),
  schema: z.object({
    season: z.string(),
    drive: z.string(),
    motors: z.number().int().nonnegative(),
    servos: z.number().int().nonnegative(),
    controlSystem: z.string(),
    status: z.enum(['Operational', 'In Build', 'Retired']),
  }),
});

const timeline = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/timeline' }),
  schema: z.object({
    /** Order on the page, lowest first. */
    order: z.number(),
    /** Display date, e.g. "July 26, 2026". */
    date: z.string(),
    title: z.string(),
  }),
});

export const collections = { logs, timeline };
