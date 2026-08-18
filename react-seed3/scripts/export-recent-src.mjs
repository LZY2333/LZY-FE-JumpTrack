import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = resolve(ROOT, 'src');
const DEFAULT_OUTPUT = resolve(ROOT, 'srctxt');
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
      output = resolve(ROOT, values[index + 1]);
      index += 1;
      continue;
    }
    if (!values[index].startsWith('-')) count = Number(values[index]);
  }
  return {
    count,
    output,
  };
};

const toTxt = (filePath) => {
  const extension = extname(filePath);
  return `${extension ? filePath.slice(0, -extension.length) : filePath}.txt`;
};

const hideDependencies = (content) => content.replace(/(^|\r?\n)([ \t]*)import(?=[ \t])/g, `$1$2${DEP_MARK}`);

const statusChanges = () => {
  const result = git(['diff', '--relative', '--name-status', '-z', '--no-renames', 'HEAD', '--', 'src']);
  const tokens = result.split('\0').filter(Boolean);
  const changes = new Map();
  for (let index = 0; index < tokens.length; index += 2) {
    changes.set(tokens[index + 1], tokens[index][0]);
  }
  for (const filePath of git(['ls-files', '--others', '--exclude-standard', '-z', '--', 'src'])
    .split('\0')
    .filter(Boolean)) {
    changes.set(filePath, 'A');
  }
  return changes;
};

const commitChanges = (count) => {
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
    'src',
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

  for (const [gitPath, type] of changes) {
    const sourcePath = resolve(ROOT, gitPath);
    const sourceRelativePath = relative(SOURCE, sourcePath);
    let content;
    if (count === 0) {
      if (existsSync(sourcePath)) content = readFileSync(sourcePath);
    } else {
      content = headFile(gitPath);
    }
    const operation = content === undefined ? 'delete' : 'upsert';
    const metadata = `${META}${JSON.stringify({ operation, path: sourceRelativePath.replaceAll('\\', '/') })}\n`;
    const outputPath = resolve(output, toTxt(sourceRelativePath));

    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(
      outputPath,
      operation === 'delete' ? metadata : metadata + hideDependencies(content.toString('utf8')),
      'utf8',
    );
    console.log(`${type} ${sourceRelativePath}`);
  }

  console.log(`Exported ${changes.size} file(s) to ${output}`);
};

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
