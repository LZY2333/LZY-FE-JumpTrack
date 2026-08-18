import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = resolve(ROOT, 'src');
const INPUT = resolve(ROOT, 'srctxt');
const META = '// @SRC ';
const DEP_MARK = '__SRC_DEP__';
const RESTORED_DEP = ['im', 'port'].join('');
const DRY_RUN = process.argv.includes('--dry-run');

const files = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });

const parse = (content) => {
  const match = content.match(/^\/\/ @SRC (.+?)(?:\r?\n|$)/);
  if (!match) return undefined;
  return { ...JSON.parse(match[1]), content: content.slice(match[0].length) };
};

const main = () => {
  let changed = 0;
  for (const inputPath of files(INPUT).filter((path) => extname(path).toLowerCase() === '.txt')) {
    const parsed = parse(readFileSync(inputPath, 'utf8'));
    if (!parsed) continue;

    const sourcePath = resolve(SOURCE, parsed.path);
    if (parsed.operation === 'delete') {
      if (existsSync(sourcePath)) {
        console.log(`${DRY_RUN ? 'Would delete' : 'Deleted'} ${relative(ROOT, sourcePath)}`);
        if (!DRY_RUN) unlinkSync(sourcePath);
        changed += 1;
      }
      continue;
    }

    const content = parsed.content.replaceAll(DEP_MARK, RESTORED_DEP);
    if (!DRY_RUN && (!existsSync(sourcePath) || readFileSync(sourcePath, 'utf8') !== content)) {
      mkdirSync(dirname(sourcePath), { recursive: true });
      writeFileSync(sourcePath, content, 'utf8');
    }
    console.log(`${DRY_RUN ? 'Would update' : 'Updated'} ${relative(ROOT, sourcePath)}`);
    changed += 1;
  }

  console.log(`${DRY_RUN ? 'Would change' : 'Changed'} ${changed} file(s).`);
};

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
