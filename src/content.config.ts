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

const crew = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/crew' }),
  schema: z.object({
    /** First name. */
    first: z.string(),
    /** Last name. */
    last: z.string(),
    /** Honorific, e.g. "Dr." */
    title: z.string().optional(),
    /** Nickname shown between first and last name. */
    nickname: z.string().optional(),
    /** Roster order within the column, lowest first. */
    order: z.number().default(0),
    /** Role label. Overrides the folder-derived role when set. */
    role: z.enum(['crew', 'coach', 'mentor']).optional(),
    /** Hide the member from the roster and person pages. */
    hidden: z.boolean().default(false),
  }),
});

export const collections = { logs, timeline, crew };
