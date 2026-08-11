/**
 * Ship's code snippets.
 *
 * Each snippet lives in its own folder under `src/content/code/`:
 *
 *   src/content/code/<working|broken>/<id>/code.m      — raw source
 *   src/content/code/<working|broken>/<id>/meta.json   — title, description, language, order
 *
 * Everything is discovered automatically at build time — drop a new folder in
 * (or run `npm run add-code`) and it shows up on the right page with no other
 * changes needed. The top-level folder (`working` / `broken`) decides which
 * page the snippet appears on.
 */

export type CodeCategory = 'working' | 'broken';

export interface CodeSnippet {
  /** Folder name of the snippet, used for anchors and ids. */
  id: string;
  /** Which page the snippet belongs on. */
  category: CodeCategory;
  /** Heading shown above the snippet. */
  title: string;
  /** Optional one-line blurb. */
  description?: string;
  /** Shiki language id used for highlighting, e.g. "java". */
  language: string;
  /** Order on the page, lowest first. */
  order: number;
  /** Raw file contents. */
  code: string;
}

interface SnippetMeta {
  title: string;
  description?: string;
  language: string;
  order?: number;
}

const metas = import.meta.glob('../content/code/*/*/meta.json', {
  eager: true,
}) as Record<string, SnippetMeta>;

const codes = import.meta.glob('../content/code/*/*/code.m', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const CATEGORIES: CodeCategory[] = ['working', 'broken'];

/** All snippets on a page, sorted by roster order. */
export function getCodeSnippets(category?: CodeCategory): CodeSnippet[] {
  const snippets: CodeSnippet[] = [];

  for (const [metaPath, meta] of Object.entries(metas)) {
    const parts = metaPath.split('/');
    const folder = parts[parts.length - 3];
    const id = parts[parts.length - 2];

    if (!CATEGORIES.includes(folder as CodeCategory)) {
      console.warn(
        `[code] Unknown category "${folder}" for ${metaPath} — expected working or broken.`,
      );
      continue;
    }
    if (category && folder !== category) continue;

    const code = codes[`${parts.slice(0, -1).join('/')}/code.m`];
    if (!code) {
      console.warn(`[code] No code.m found for ${metaPath} — skipping.`);
      continue;
    }

    snippets.push({
      id,
      category: folder as CodeCategory,
      code,
      order: meta.order ?? 0,
      title: meta.title,
      description: meta.description,
      language: meta.language,
    });
  }

  return snippets.sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title),
  );
}
