import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUTPUT = resolve(ROOT, 'srctxt');
const SOURCE_ROOTS = [
  { name: 'src', path: resolve(ROOT, 'src'), outputPrefix: '' },
  { name: 'mock', path: resolve(ROOT, 'mock'), outputPrefix: 'mock' },
];
const META = '// @SRC ';
const DEP_MARK = '__SRC_DEP__';

const git = (args, encoding = 'utf8') => {
  const result = spawnSync('git', ['-c', 'core.quotepath=false', '-C', ROOT, ...args], {
    encoding,
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(result.stderr?.toString() || 'Git command failed.');
  return result.stdout;
};

const parseArgs = () => {
  const values = process.argv.slice(2);
  let count = 1;
  let output = DEFAULT_OUTPUT;
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === '--output' || values[index] === '-o') {
      if (!values[index + 1]) throw new Error('Missing output directory after --output.');
      output = resolve(ROOT, values[index + 1]);
      index += 1;
      continue;
    }
    if (!values[index].startsWith('-')) count = Number(values[index]);
  }
  if (!Number.isInteger(count) || count < 0) {
    throw new Error('Commit count must be a non-negative integer.');
  }
  return { count, output };
};

const toTxt = (filePath) => {
  const extension = extname(filePath);
  return `${extension ? filePath.slice(0, -extension.length) : filePath}.txt`;
};

const hideDependencies = (content) => content.replace(/(^|\r?\n)([ \t]*)import(?=[ \t])/g, `$1$2${DEP_MARK}`);

const findSourceRoot = (gitPath) => SOURCE_ROOTS.find(({ name }) => gitPath === name || gitPath.startsWith(`${name}/`));

const statusChanges = () => {
  const sourceNames = SOURCE_ROOTS.map(({ name }) => name);
  const result = git(['diff', '--relative', '--name-status', '-z', '--no-renames', 'HEAD', '--', ...sourceNames]);
  const tokens = result.split('\0').filter(Boolean);
  const changes = new Map();
  for (let index = 0; index < tokens.length; index += 2) {
    changes.set(tokens[index + 1], tokens[index][0]);
  }
  for (const filePath of git(['ls-files', '--others', '--exclude-standard', '-z', '--', ...sourceNames])
    .split('\0')
    .filter(Boolean)) {
    changes.set(filePath, 'A');
  }
  return changes;
};

const commitChanges = (count) => {
  const sourceNames = SOURCE_ROOTS.map(({ name }) => name);
  const paths = git([
    'log',
    '--relative',
    '-n',
    String(count),
    '--format=',
    '--name-only',
    '-z',
    '--no-renames',
    '--',
    ...sourceNames,
  ])
    .split('\0')
    .filter(Boolean);
  return new Map(paths.map((filePath) => [filePath, 'C']));
};

const headFile = (filePath) => {
  const result = spawnSync('git', ['-c', 'core.quotepath=false', '-C', ROOT, 'show', `HEAD:./${filePath}`], {
    encoding: null,
    maxBuffer: 20 * 1024 * 1024,
  });
  return result.status === 0 ? result.stdout : undefined;
};

const main = () => {
  const { count, output } = parseArgs();
  const changes = count === 0 ? statusChanges() : commitChanges(count);
  const hasMockDirectory = existsSync(resolve(ROOT, 'mock'));
  console.log(`Mock directory ${hasMockDirectory ? 'detected' : 'not found'}.`);

  for (const [gitPath, type] of changes) {
    const sourceRoot = findSourceRoot(gitPath);
    if (!sourceRoot) throw new Error(`Unsupported source path: ${gitPath}`);

    const sourcePath = resolve(ROOT, gitPath);
    const sourceRelativePath = relative(sourceRoot.path, sourcePath).replaceAll('\\', '/');
    const exportRelativePath = sourceRoot.outputPrefix
      ? `${sourceRoot.outputPrefix}/${sourceRelativePath}`
      : sourceRelativePath;
    let content;
    if (count === 0) {
      if (existsSync(sourcePath)) content = readFileSync(sourcePath);
    } else {
      content = headFile(gitPath);
    }

    const operation = content === undefined ? 'delete' : 'upsert';
    const metadata = `${META}${JSON.stringify({
      operation,
      sourceRoot: sourceRoot.name,
      path: sourceRelativePath,
    })}\n`;
    const outputPath = resolve(output, toTxt(exportRelativePath));

    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(
      outputPath,
      operation === 'delete' ? metadata : metadata + hideDependencies(content.toString('utf8')),
      'utf8',
    );
    console.log(`${type} ${gitPath}`);
  }

  console.log(`Exported ${changes.size} file(s) to ${output}`);
};

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
