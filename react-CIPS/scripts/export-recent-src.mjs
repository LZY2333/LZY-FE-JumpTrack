import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// 默认配置：目录路径相对于 react-seed3 项目根目录，src 即 react-seed3/src。
const CONFIG = {
  sourceDirectory: 'src',
  outputDirectory: 'srctxt',
  defaultCommitCount: 1,
};

const printUsage = () => {
  console.log(`Usage:
  npm run export:src
  npm run export:src -- [commit-count]
  node scripts/export-recent-src.mjs [commit-count] [--output <directory>]

Examples:
  npm run export:src
  npm run export:src -- 5
  node scripts/export-recent-src.mjs 10 --output srctxt

Defaults:
  Source directory: <project>/${CONFIG.sourceDirectory}
  Commit count: ${CONFIG.defaultCommitCount}
  Output directory: <project>/${CONFIG.outputDirectory}`);
};

const parseArguments = (argumentsToParse) => {
  let commitCount;
  let outputPath;

  for (let index = 0; index < argumentsToParse.length; index += 1) {
    const argument = argumentsToParse[index];

    if (argument === '--help' || argument === '-h') {
      printUsage();
      process.exit(0);
    }

    if (argument === '--output' || argument === '-o') {
      outputPath = argumentsToParse[index + 1];
      if (!outputPath) {
        throw new Error(`${argument} requires a directory path.`);
      }
      index += 1;
      continue;
    }

    if (argument.startsWith('-')) {
      throw new Error(`Unknown option: ${argument}`);
    }

    if (commitCount !== undefined) {
      throw new Error(`Unexpected argument: ${argument}`);
    }
    commitCount = Number(argument);
  }

  commitCount ??= CONFIG.defaultCommitCount;

  if (!Number.isSafeInteger(commitCount) || commitCount <= 0) {
    throw new Error('commit-count must be a positive integer.');
  }

  return { commitCount, outputPath };
};

const runGit = (projectRoot, argumentsToRun) => {
  const result = spawnSync('git', ['-c', 'core.quotepath=false', '-C', projectRoot, ...argumentsToRun], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });

  if (result.error) {
    throw new Error(`Unable to run Git: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || 'Git command failed.');
  }

  return result.stdout;
};

const getScriptKind = (filePath) => {
  const lowerCasePath = filePath.toLowerCase();

  if (lowerCasePath.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (lowerCasePath.endsWith('.jsx')) return ts.ScriptKind.JSX;
  if (lowerCasePath.endsWith('.ts') || lowerCasePath.endsWith('.mts') || lowerCasePath.endsWith('.cts')) {
    return ts.ScriptKind.TS;
  }
  if (lowerCasePath.endsWith('.js') || lowerCasePath.endsWith('.mjs') || lowerCasePath.endsWith('.cjs')) {
    return ts.ScriptKind.JS;
  }

  return undefined;
};

const extendPastLineEnding = (content, statementEnd) => {
  let rangeEnd = statementEnd;

  while (content[rangeEnd] === ' ' || content[rangeEnd] === '\t') {
    rangeEnd += 1;
  }
  if (content.startsWith('\r\n', rangeEnd)) {
    return rangeEnd + 2;
  }
  if (content[rangeEnd] === '\n' || content[rangeEnd] === '\r') {
    return rangeEnd + 1;
  }

  return statementEnd;
};

const removeLeadingImports = (filePath, content) => {
  const scriptKind = getScriptKind(filePath);
  if (scriptKind === undefined) {
    return content;
  }

  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, scriptKind);
  let importBoundary = 0;

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) && !ts.isImportEqualsDeclaration(statement)) {
      break;
    }

    importBoundary = extendPastLineEnding(content, statement.end);
  }

  return content.slice(importBoundary);
};

const isBinaryContent = (contentBuffer) => {
  const bytesToInspect = contentBuffer.subarray(0, Math.min(contentBuffer.length, 8192));
  return bytesToInspect.includes(0);
};

const toOutputRelativePath = (sourceRelativePath) => {
  const extension = extname(sourceRelativePath);
  if (!extension) {
    return `${sourceRelativePath}.txt`;
  }

  return `${sourceRelativePath.slice(0, -extension.length)}.txt`;
};

const main = () => {
  const { commitCount, outputPath } = parseArguments(process.argv.slice(2));
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const projectRoot = resolve(scriptDirectory, '..');
  const sourceRoot = resolve(projectRoot, CONFIG.sourceDirectory);
  const outputRoot = outputPath ? resolve(projectRoot, outputPath) : resolve(projectRoot, CONFIG.outputDirectory);

  if (!existsSync(sourceRoot) || !statSync(sourceRoot).isDirectory()) {
    throw new Error(`Source directory does not exist: ${sourceRoot}`);
  }

  const changedPaths = runGit(projectRoot, [
    'log',
    '--relative',
    '-n',
    String(commitCount),
    '--format=',
    '--name-only',
    '--diff-filter=ACMRT',
  ])
    .split(/\r?\n/)
    .map((filePath) => filePath.trim())
    .filter(Boolean);

  const sourcePaths = [...new Set(changedPaths)]
    .map((gitPath) => resolve(projectRoot, gitPath))
    .filter((sourcePath) => {
      const pathWithinSource = relative(sourceRoot, sourcePath);
      return (
        pathWithinSource !== '' &&
        !pathWithinSource.startsWith('..') &&
        !isAbsolute(pathWithinSource) &&
        existsSync(sourcePath) &&
        statSync(sourcePath).isFile()
      );
    });

  const outputMappings = sourcePaths.map((sourcePath) => {
    const sourceRelativePath = relative(sourceRoot, sourcePath);
    return {
      sourcePath,
      sourceRelativePath,
      destinationPath: resolve(outputRoot, toOutputRelativePath(sourceRelativePath)),
    };
  });

  const destinations = new Map();
  for (const mapping of outputMappings) {
    const destinationKey = mapping.destinationPath.toLowerCase();
    const existingSource = destinations.get(destinationKey);
    if (existingSource) {
      throw new Error(`Output path collision: ${existingSource} and ${mapping.sourceRelativePath}`);
    }
    destinations.set(destinationKey, mapping.sourceRelativePath);
  }

  let exportedCount = 0;
  const skippedBinaryPaths = [];

  for (const mapping of outputMappings) {
    const contentBuffer = readFileSync(mapping.sourcePath);
    if (isBinaryContent(contentBuffer)) {
      skippedBinaryPaths.push(mapping.sourceRelativePath);
      continue;
    }

    const content = contentBuffer.toString('utf8');
    const outputContent = removeLeadingImports(mapping.sourcePath, content);
    mkdirSync(dirname(mapping.destinationPath), { recursive: true });
    writeFileSync(mapping.destinationPath, outputContent, 'utf8');
    exportedCount += 1;
    console.log(`${mapping.sourceRelativePath} -> ${relative(projectRoot, mapping.destinationPath)}`);
  }

  console.log(`Exported ${exportedCount} file(s) changed in the latest ${commitCount} commit(s).`);
  console.log(`Output directory: ${outputRoot}`);

  if (skippedBinaryPaths.length > 0) {
    console.warn(`Skipped ${skippedBinaryPaths.length} binary file(s): ${skippedBinaryPaths.join(', ')}`);
  }
};

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  printUsage();
  process.exitCode = 1;
}
