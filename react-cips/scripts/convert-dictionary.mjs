import { readFileSync, writeFileSync } from 'node:fs';

// 将同目录 index.txt 中的字典记录转换为按 type 分组的 index.json
const text = readFileSync(new URL('./index.txt', import.meta.url), 'utf8');
const options = {};

for (const match of text.matchAll(/\(\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'[^)]*\)/g)) {
  const [, type, label, value] = match;
  (options[type] ??= []).push({ value, label });
}

const json = Object.entries(options).map(([type, items]) => {
  const rows = items.map(({ value, label }) =>
    `    { "value": ${JSON.stringify(value)}, "label": ${JSON.stringify(label)} }`,
  );
  return `  ${JSON.stringify(type)}: [\n${rows.join(',\n')}\n  ]`;
});

writeFileSync(new URL('./index.json', import.meta.url), `{\n${json.join(',\n')}\n}\n`);
