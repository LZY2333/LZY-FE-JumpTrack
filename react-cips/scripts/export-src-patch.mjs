import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUTPUT = resolve(ROOT, 'src.patch');
const SOURCE_ROOTS = ['src', 'mock'];
const MAX_BUFFER_SIZE = 100 * 1024 * 1024;
const DEP_MARK = '__SRC_DEP__';

// 导出指定提交范围或当前工作区的源码差异为单个 Git 补丁。
const main = () => {
  const { count, output } = parseArgs();
  const patch = count === 0 ? createWorkingTreePatch() : createCommitPatch(count);
  const encryptedPatch = hideDependencies(patch);

  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, encryptedPatch);

  const source = count === 0 ? 'working tree against HEAD' : `last ${count} commit(s)`;
  console.log(`Exported ${source} to ${output} (${encryptedPatch.length} bytes).`);
};

// 隐藏补丁代码行中的 import 关键字，避免导出文件保留可识别的依赖声明。
const hideDependencies = (patch) =>
  Buffer.from(patch.toString('utf8').replace(/(^|\r?\n)([ +\-][ \t]*)import(?=[ \t])/g, `$1$2${DEP_MARK}`), 'utf8');

// 解析与旧导出脚本一致的提交数量，并支持自定义补丁输出路径。
const parseArgs = () => {
  const values = process.argv.slice(2);
  let count = 1;
  let output = DEFAULT_OUTPUT;

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--output' || value === '-o') {
      if (!values[index + 1]) throw new Error('Missing output file after --output.');
      output = resolve(ROOT, values[index + 1]);
      index += 1;
      continue;
    }
    if (!value.startsWith('-')) {
      count = Number(value);
      continue;
    }
    throw new Error(`Unsupported argument: ${value}`);
  }

  if (!Number.isInteger(count) || count < 0) {
    throw new Error('Commit count must be a non-negative integer.');
  }
  return { count, output };
};

// 生成 HEAD 到当前工作区的补丁，并补充 Git 默认忽略的未跟踪文件。
const createWorkingTreePatch = () => {
  const trackedPatch = git([
    'diff',
    '--relative',
    '--binary',
    '--full-index',
    '--no-ext-diff',
    '--no-renames',
    'HEAD',
    '--',
    ...SOURCE_ROOTS,
  ]).stdout;
  const untrackedFiles = git(['ls-files', '--others', '--exclude-standard', '-z', '--', ...SOURCE_ROOTS])
    .stdout.toString('utf8')
    .split('\0')
    .filter(Boolean);
  const patches = [trackedPatch];

  for (const filePath of untrackedFiles) {
    patches.push(
      git(
        ['diff', '--relative', '--no-index', '--binary', '--full-index', '--no-ext-diff', '--', '/dev/null', filePath],
        [0, 1],
      ).stdout,
    );
  }

  return joinPatches(patches);
};

// 生成最近若干个源码相关提交形成的累计补丁，不受同仓库其他项目提交干扰。
const createCommitPatch = (count) => {
  const commits = git(['log', `--max-count=${count}`, '--format=%H', '--', ...SOURCE_ROOTS])
    .stdout.toString('utf8')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  if (commits.length === 0) return Buffer.alloc(0);

  const oldestCommit = commits[commits.length - 1];
  const parent = git(['rev-parse', '--verify', `${oldestCommit}^`], [0, 128]);
  const base =
    parent.status === 0
      ? parent.stdout.toString('utf8').trim()
      : git(['hash-object', '-t', 'tree', '--stdin'], [0], Buffer.alloc(0)).stdout.toString('utf8').trim();
  return git([
    'diff',
    '--relative',
    '--binary',
    '--full-index',
    '--no-ext-diff',
    '--no-renames',
    base,
    'HEAD',
    '--',
    ...SOURCE_ROOTS,
  ]).stdout;
};

// 用换行分隔各段补丁，同时保持 Git 输出的原始字节内容。
const joinPatches = (patches) => {
  const nonEmptyPatches = patches.filter(({ length }) => length > 0);
  if (nonEmptyPatches.length === 0) return Buffer.alloc(0);

  const chunks = [];
  for (const patch of nonEmptyPatches) {
    chunks.push(patch);
    if (patch[patch.length - 1] !== 10) chunks.push(Buffer.from('\n'));
  }
  return Buffer.concat(chunks);
};

// 执行 Git 命令并保留补丁的二进制安全输出。
const git = (args, acceptedStatuses = [0], input) => {
  const result = spawnSync('git', ['-c', 'core.quotepath=false', '-C', ROOT, ...args], {
    encoding: null,
    input,
    maxBuffer: MAX_BUFFER_SIZE,
  });
  if (!acceptedStatuses.includes(result.status)) {
    throw new Error(result.stderr?.toString('utf8').trim() || 'Git command failed.');
  }
  return result;
};

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
