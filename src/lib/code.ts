/**
 * Ship's code snippets.
 *
 * Each snippet is stored as a plain `.m` file under `src/content/code/`
 * (raw source, no frontmatter — what you see on the page is exactly what's
 * in the file). Metadata lives here, keyed by file name without the `.m`.
 * Drop a new `.m` file in and add its entry below to list it on /code/.
 */

export interface CodeSnippet {
  /** File name without the `.m` extension — used for anchors and ids. */
  id: string;
  /** Heading shown above the snippet. */
  title: string;
  /** Optional one-line blurb. */
  description?: string;
  /** Shiki language id used for highlighting, e.g. "java". */
  language: string;
  /** Order on the page, lowest first. Defaults to 0. */
  order?: number;
  /** Raw file contents. */
  code: string;
}

const raw = import.meta.glob('../content/code/*.m', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const META: Record<string, Omit<CodeSnippet, 'id' | 'code'>> = {
  constants: {
    title: 'Drive Constants & Follower',
    description:
      'Single source of truth for the pedroPathing follower: drivetrain wiring, encoder directions and tick conversion, plus a ready-made follower factory.',
    language: 'java',
    order: 1,
  },
};

export function getCodeSnippets(): CodeSnippet[] {
  const snippets = Object.entries(raw)
    .map(([path, code]) => {
      const id = path.split('/').pop()?.replace(/\.m$/, '') ?? path;
      const meta = META[id];
      if (!meta) {
        console.warn(
          `[code] No metadata for ${path} — add an entry to META in src/lib/code.ts to list it on /code/.`,
        );
        return null;
      }
      return { id, code, ...meta } as CodeSnippet;
    })
    .filter((snippet): snippet is CodeSnippet => snippet !== null);

  return snippets.sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title),
  );
}
