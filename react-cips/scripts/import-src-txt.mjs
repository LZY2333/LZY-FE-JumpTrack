import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_INPUT = resolve(ROOT, 'srctxt');
const SOURCE_ROOTS = new Map([
  ['src', resolve(ROOT, 'src')],
  ['mock', resolve(ROOT, 'mock')],
]);
const META = '// @SRC ';
const DEP_MARK = '__SRC_DEP__';
const RESTORED_DEP = ['im', 'port'].join('');

const parseArgs = () => {
  const values = process.argv.slice(2);
  let input = DEFAULT_INPUT;
  let dryRun = false;
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === '--input' || values[index] === '-i') {
      if (!values[index + 1]) throw new Error('Missing input directory after --input.');
      input = resolve(ROOT, values[index + 1]);
      index += 1;
      continue;
    }
    if (values[index] === '--dry-run') dryRun = true;
  }
  return { input, dryRun };
};

const files = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });

const parse = (content, inputPath) => {
  const match = content.match(/^\/\/ @SRC (.+?)(?:\r?\n|$)/);
  if (!match) return undefined;

  try {
    return { ...JSON.parse(match[1]), content: content.slice(match[0].length) };
  } catch {
    throw new Error(`Invalid metadata in ${relative(ROOT, inputPath)}`);
  }
};

const resolveSourcePath = (sourceRootName, sourceRelativePath) => {
  const sourceRoot = SOURCE_ROOTS.get(sourceRootName);
  if (!sourceRoot) throw new Error(`Unsupported source root: ${sourceRootName}`);
  if (typeof sourceRelativePath !== 'string' || !sourceRelativePath) {
    throw new Error('Source metadata path must be a non-empty string.');
  }

  const sourcePath = resolve(sourceRoot, sourceRelativePath);
  const relativePath = relative(sourceRoot, sourcePath);
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error(`Source path escapes ${sourceRootName}: ${sourceRelativePath}`);
  }
  return sourcePath;
};

const main = () => {
  const { input, dryRun } = parseArgs();
  if (!existsSync(input)) throw new Error(`Input directory not found: ${input}`);

  const hasMockExport = existsSync(resolve(input, 'mock'));
  console.log(`Mock export ${hasMockExport ? 'detected' : 'not found'}.`);

  let changed = 0;
  for (const inputPath of files(input).filter((path) => extname(path).toLowerCase() === '.txt')) {
    const parsed = parse(readFileSync(inputPath, 'utf8'), inputPath);
    if (!parsed) continue;
    if (parsed.operation !== 'upsert' && parsed.operation !== 'delete') {
      throw new Error(`Unsupported operation in ${relative(ROOT, inputPath)}: ${parsed.operation}`);
    }

    const sourceRootName = parsed.sourceRoot || 'src';
    const sourcePath = resolveSourcePath(sourceRootName, parsed.path);
    if (parsed.operation === 'delete') {
      if (!existsSync(sourcePath)) continue;
      console.log(`${dryRun ? 'Would delete' : 'Deleted'} ${relative(ROOT, sourcePath)}`);
      if (!dryRun) unlinkSync(sourcePath);
      changed += 1;
      continue;
    }

    const content = parsed.content.replaceAll(DEP_MARK, RESTORED_DEP);
    if (existsSync(sourcePath) && readFileSync(sourcePath, 'utf8') === content) continue;

    console.log(`${dryRun ? 'Would update' : 'Updated'} ${relative(ROOT, sourcePath)}`);
    if (!dryRun) {
      mkdirSync(dirname(sourcePath), { recursive: true });
      writeFileSync(sourcePath, content, 'utf8');
    }
    changed += 1;
  }

  console.log(`${dryRun ? 'Would change' : 'Changed'} ${changed} file(s).`);
};

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
