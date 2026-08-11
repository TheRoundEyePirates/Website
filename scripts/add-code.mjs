#!/usr/bin/env node
/**
 * Add a new code snippet to the site — no other files need changing.
 *
 *   npm run add-code
 *
 * Prompts for the details, then creates:
 *
 *   src/content/code/<working|broken>/<id>/code.m
 *   src/content/code/<working|broken>/<id>/meta.json
 *
 * The snippet appears on /code/ (working) or /code/broken/ automatically.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = join(root, 'src', 'content', 'code');

const rl = readline.createInterface({ input, output, terminal: Boolean(process.stdin.isTTY) });

// Answer queue shared between interactive and piped input: readline 'line'
// events fill the queue; `ask`/`promptCode` consume from it (or wait for the
// next line when interactive).
const answerQueue = [];
let resolveNext = null;

rl.on('line', (line) => {
  if (resolveNext) {
    const resolve = resolveNext;
    resolveNext = null;
    resolve(line);
  } else {
    answerQueue.push(line);
  }
});

function nextAnswer() {
  return new Promise((resolve) => {
    if (answerQueue.length) {
      resolve(answerQueue.shift());
    } else {
      resolveNext = resolve;
    }
  });
}

function ask(question, fallback = '') {
  const suffix = fallback ? ` [${fallback}]` : '';
  output.write(`${question}${suffix}: `);
  return nextAnswer().then((answer) => answer.trim() || fallback);
}

async function promptCode() {
  console.log(
    '\nPaste your code below. When you are done, type DONE on its own line and press Enter.\n',
  );
  const lines = [];
  while (true) {
    const line = await nextAnswer();
    if (line.trim() === 'DONE') break;
    lines.push(line);
  }
  return lines.join('\n');
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function existingIds() {
  const { readdir } = await import('node:fs/promises');
  const ids = [];
  for (const category of ['working', 'broken']) {
    let entries;
    try {
      entries = await readdir(join(base, category), { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      let order = 0;
      try {
        const meta = JSON.parse(
          await readFile(join(base, category, entry.name, 'meta.json'), 'utf8'),
        );
        order = meta.order ?? 0;
      } catch {
        // No meta.json yet — treat as order 0.
      }
      ids.push({ category, id: entry.name, order });
    }
  }
  return ids;
}

const category = await ask('Category', 'working');
const requestedId = await ask('Folder name (e.g. constants, climb-mechanism)');
const id = slugify(requestedId);

const title = await ask('Title (heading shown on the page)');
const description = await ask('Description (one-line blurb)', '');
const language = await ask('Language', 'java');

if (!['working', 'broken'].includes(category)) {
  console.error(`\nUnknown category "${category}" — use working or broken.`);
  process.exit(1);
}
if (!id) {
  console.error('\nFolder name cannot be empty.');
  process.exit(1);
}
if (!title) {
  console.error('\nTitle cannot be empty.');
  process.exit(1);
}

const existing = (await existingIds()).find((s) => s.category === category && s.id === id);
if (existing) {
  console.error(`\nA snippet named "${id}" already exists under ${category}/ — pick another name.`);
  process.exit(1);
}

const code = await promptCode();
if (!code.trim()) {
  console.error('\nNo code pasted — nothing written.');
  process.exit(1);
}

const maxOrder = Math.max(
  0,
  ...(await existingIds())
    .filter((s) => s.category === category)
    .map((s) => s.order),
);
const order = maxOrder + 1;

await mkdir(join(base, category, id), { recursive: true });
await writeFile(join(base, category, id, 'code.m'), code, 'utf8');
await writeFile(
  join(base, category, id, 'meta.json'),
  JSON.stringify(
    {
      title,
      ...(description ? { description } : {}),
      language,
      order,
    },
    null,
    2,
  ),
  'utf8',
);

rl.close();
console.log(`\nCreated snippet "${id}" on the ${category} page:`);
console.log(`  src/content/code/${category}/${id}/code.m`);
console.log(`  src/content/code/${category}/${id}/meta.json`);
console.log('\nThat is all — rebuild (npm run build) and it appears automatically.');
