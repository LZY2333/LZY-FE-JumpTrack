import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_INPUT = resolve(ROOT, 'src.patch');
const SOURCE_ROOTS = ['src', 'mock'];
const MAX_BUFFER_SIZE = 100 * 1024 * 1024;

// 应用源码补丁；上下文不匹配时自动尝试 Git 三方合并。
const main = () => {
  const { input, dryRun } = parseArgs();
  if (!existsSync(input)) throw new Error(`Input patch not found: ${input}`);
  if (readFileSync(input).length === 0) {
    console.log('Patch is empty; no files need to be changed.');
    return;
  }

  const applyContext = resolveApplyContext();
  const { repositoryRoot, directoryOption } = applyContext;
  const directCheck = git(
    ['apply', ...directoryOption, '--check', '--whitespace=nowarn', input],
    [0, 1],
    repositoryRoot,
  );
  if (directCheck.status === 0) {
    if (dryRun) {
      console.log(`Patch can be applied directly: ${input}`);
      return;
    }
    git(['apply', ...directoryOption, '--whitespace=nowarn', input], [0], repositoryRoot);
    console.log(`Applied patch directly: ${input}`);
    return;
  }

  console.log('Patch context differs; attempting a three-way merge.');
  const mergeResult = withTemporaryIndex(applyContext, (environment) => {
    stageCurrentSourceFiles(applyContext, environment);
    if (dryRun) {
      const mergeCheck = git(
        ['apply', ...directoryOption, '--check', '--3way', '--whitespace=nowarn', input],
        [0, 1],
        repositoryRoot,
        environment,
      );
      return { merge: mergeCheck, conflicts: [] };
    }

    const merge = git(
      ['apply', ...directoryOption, '--3way', '--whitespace=nowarn', input],
      [0, 1],
      repositoryRoot,
      environment,
    );
    const conflicts = git(['diff', '--name-only', '--diff-filter=U', '-z'], [0], repositoryRoot, environment)
      .stdout.toString('utf8')
      .split('\0')
      .filter(Boolean);
    return { merge, conflicts };
  });

  const { merge, conflicts } = mergeResult;
  printGitOutput(merge);
  if (merge.status === 0) {
    console.log(
      dryRun
        ? `Patch can be applied with a three-way merge: ${input}`
        : `Applied patch with a three-way merge: ${input}`,
    );
    return;
  }

  if (dryRun) throw new Error('Three-way merge check found conflicts or missing base blobs.');
  if (conflicts.length === 0) {
    applyWithRejects(input, applyContext);
    return;
  }

  console.error('Patch was applied with conflicts; modified files and conflict markers were preserved:');
  for (const filePath of conflicts) console.error(`  ${filePath}`);
  console.error('Resolve the conflicts, then inspect the result with git diff.');
  process.exitCode = 1;
};

// 三方合并缺少基础 blob 时，应用所有可定位代码块，并将其余内容保存为 .rej 文件。
const applyWithRejects = (input, { repositoryRoot, directoryOption }) => {
  console.log('Three-way merge is unavailable; applying matching hunks and preserving rejects.');
  const rejectResult = git(
    ['apply', ...directoryOption, '--reject', '--whitespace=nowarn', input],
    [0, 1],
    repositoryRoot,
  );
  printGitOutput(rejectResult);
  if (rejectResult.status === 0) {
    console.log(`Applied patch with reject fallback: ${input}`);
    return;
  }

  console.error('Applicable hunks were applied; unresolved hunks were saved as adjacent .rej files.');
  console.error('Inspect the changes with git diff and merge each .rej file manually.');
  process.exitCode = 1;
};

// 将相对项目路径的补丁准确映射到当前项目在 Git 仓库中的目录。
const resolveApplyContext = () => {
  const repositoryRoot = git(['rev-parse', '--show-toplevel']).stdout.toString('utf8').trim();
  const projectPrefix = git(['rev-parse', '--show-prefix']).stdout.toString('utf8').trim();
  return {
    repositoryRoot,
    projectPrefix,
    directoryOption: projectPrefix ? [`--directory=${projectPrefix}`] : [],
  };
};

// 使用临时 index 完成三方合并，使真实暂存区保持原样，并让结果可直接通过 git diff 查看。
const withTemporaryIndex = ({ repositoryRoot }, callback) => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'src-patch-'));
  const temporaryIndex = join(temporaryDirectory, 'index');
  const indexPathValue = git(['rev-parse', '--git-path', 'index'], [0], repositoryRoot).stdout.toString('utf8').trim();
  const indexPath = resolve(repositoryRoot, indexPathValue);

  try {
    const environment = { ...process.env, GIT_INDEX_FILE: temporaryIndex };
    if (existsSync(indexPath)) {
      copyFileSync(indexPath, temporaryIndex);
    } else {
      git(['read-tree', 'HEAD'], [0], repositoryRoot, environment);
    }
    return callback(environment);
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
};

// 在临时 index 中登记目标项目当前内容，使未提交修改也能参与三方合并。
const stageCurrentSourceFiles = ({ repositoryRoot, projectPrefix }, environment) => {
  const sourcePaths = SOURCE_ROOTS.map((sourceRoot) => `${projectPrefix}${sourceRoot}`);
  const trackedFiles = git(['ls-files', '-z', '--', ...sourcePaths], [0], repositoryRoot)
    .stdout.toString('utf8')
    .split('\0')
    .filter(Boolean);
  const existingSourcePaths = sourcePaths.filter(
    (sourcePath) =>
      existsSync(resolve(repositoryRoot, sourcePath)) ||
      trackedFiles.some((filePath) => filePath === sourcePath || filePath.startsWith(`${sourcePath}/`)),
  );
  if (existingSourcePaths.length === 0) return;

  git(['add', '-A', '--', ...existingSourcePaths], [0], repositoryRoot, environment);
};

// 解析补丁输入路径和只检查不修改的 dry-run 选项。
const parseArgs = () => {
  const values = process.argv.slice(2);
  let input = DEFAULT_INPUT;
  let dryRun = false;

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--input' || value === '-i') {
      if (!values[index + 1]) throw new Error('Missing input file after --input.');
      input = resolve(ROOT, values[index + 1]);
      index += 1;
      continue;
    }
    if (value === '--dry-run') {
      dryRun = true;
      continue;
    }
    throw new Error(`Unsupported argument: ${value}`);
  }
  return { input, dryRun };
};

// 输出 Git 的合并信息，便于定位自动合并或冲突文件。
const printGitOutput = ({ stdout, stderr }) => {
  const output = Buffer.concat([stdout, stderr]).toString('utf8').trim();
  if (output) console.log(output);
};

// 执行 Git 命令，并允许调用方处理预期内的检查失败或合并冲突。
const git = (args, acceptedStatuses = [0], workingDirectory = ROOT, environment = process.env) => {
  const result = spawnSync('git', ['-c', 'core.quotepath=false', '-C', workingDirectory, ...args], {
    encoding: null,
    env: environment,
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
