import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// 目录路径相对于 react-seed3 项目根目录。
const CONFIG = {
  sourceDirectory: 'src',
  inputDirectory: 'srctxt',
};

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(projectRoot, CONFIG.sourceDirectory);
const inputRoot = resolve(projectRoot, CONFIG.inputDirectory);
const dryRun = process.argv.includes('--dry-run');

const scriptKinds = new Map([
  ['.ts', ts.ScriptKind.TS],
  ['.mts', ts.ScriptKind.TS],
  ['.cts', ts.ScriptKind.TS],
  ['.tsx', ts.ScriptKind.TSX],
  ['.js', ts.ScriptKind.JS],
  ['.mjs', ts.ScriptKind.JS],
  ['.cjs', ts.ScriptKind.JS],
  ['.jsx', ts.ScriptKind.JSX],
]);

const walkFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);
    return entry.isDirectory() ? walkFiles(entryPath) : [entryPath];
  });

const toTxtPath = (filePath) => {
  const extension = extname(filePath);
  return `${extension ? filePath.slice(0, -extension.length) : filePath}.txt`;
};

const movePastLineEnding = (content, position) => {
  while (content[position] === ' ' || content[position] === '\t') position += 1;
  if (content.startsWith('\r\n', position)) return position + 2;
  if (content[position] === '\n' || content[position] === '\r') return position + 1;
  return position;
};

const getImportEnd = (sourcePath, content) => {
  const scriptKind = scriptKinds.get(extname(sourcePath).toLowerCase());
  if (!scriptKind) return 0;

  const sourceFile = ts.createSourceFile(sourcePath, content, ts.ScriptTarget.Latest, true, scriptKind);
  let importEnd = 0;

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) && !ts.isImportEqualsDeclaration(statement)) break;
    importEnd = movePastLineEnding(content, statement.end);
  }

  return importEnd;
};

const sourceMap = new Map();
for (const sourcePath of walkFiles(sourceRoot)) {
  const key = toTxtPath(relative(sourceRoot, sourcePath)).toLowerCase();
  if (sourceMap.has(key)) throw new Error(`源文件映射重复：${key}`);
  sourceMap.set(key, sourcePath);
}

const replacements = walkFiles(inputRoot)
  .filter((txtPath) => extname(txtPath).toLowerCase() === '.txt')
  .map((txtPath) => {
    const key = relative(inputRoot, txtPath).toLowerCase();
    const sourcePath = sourceMap.get(key);
    if (!sourcePath) throw new Error(`找不到对应源文件：${key}`);

    const sourceContent = readFileSync(sourcePath, 'utf8');
    const txtContent = readFileSync(txtPath, 'utf8');
    const importEnd = getImportEnd(sourcePath, sourceContent);
    let importContent = sourceContent.slice(0, importEnd);

    if (importContent && txtContent && !/[\r\n]$/.test(importContent) && !/^[\r\n]/.test(txtContent)) {
      importContent += sourceContent.includes('\r\n') ? '\r\n' : '\n';
    }

    return { sourcePath, txtPath, content: importContent + txtContent };
  });

let changedCount = 0;
for (const replacement of replacements) {
  const oldContent = readFileSync(replacement.sourcePath, 'utf8');
  if (oldContent === replacement.content) continue;

  changedCount += 1;
  const mapping = `${relative(inputRoot, replacement.txtPath)} -> ${relative(projectRoot, replacement.sourcePath)}`;
  console.log(`${dryRun ? 'Would update' : 'Updated'}: ${mapping}`);
  if (!dryRun) writeFileSync(replacement.sourcePath, replacement.content, 'utf8');
}

console.log(`${dryRun ? 'Would update' : 'Updated'} ${changedCount} of ${replacements.length} source file(s).`);
