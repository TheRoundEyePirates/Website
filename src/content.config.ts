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
    /** Show the nickname@theroundeyepirates.com email on the person page. */
    showEmail: z.boolean().default(true),
    /** Roster order within the column, lowest first. */
    order: z.number().default(0),
    /** Role label. Overrides the folder-derived role when set. */
    role: z.enum(['crew', 'coach', 'mentor']).optional(),
    /** Hide the member from the roster and person pages. */
    hidden: z.boolean().default(false),
    /** FTC Scout API config — renders a live team-data panel on the person page. */
    api: z
      .object({
        /** FTC team number, e.g. 30841. */
        team: z.number(),
        /** Season, e.g. 2025. Omit for the API's default season. */
        season: z.number().optional(),
      })
      .optional(),
    /** Live display embeds — rendered as iframes on the person page. */
    live: z
      .array(
        z.object({
          /** Short label shown above the embed, e.g. "Live Stream". */
          label: z.string(),
          /** URL to embed. Must be embeddable (no X-Frame-Options block). */
          url: z.string(),
          /** Aspect ratio of the embed frame, e.g. "16 / 9". */
          aspect: z.string().default('16 / 9'),
        }),
      )
      .optional(),
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    /** Display date, e.g. "August 5, 2026". */
    date: z.string(),
    /** Entry number shown in the header, e.g. "No. 001". */
    entry: z.string().default('001'),
  }),
});

export const collections = { logs, timeline, crew, journal };
