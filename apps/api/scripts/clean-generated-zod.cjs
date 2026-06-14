const { writeFileSync, readFileSync } = require('fs');
const { join } = require('path');

const INPUT_TYPES_DIR = join(
  __dirname,
  '..',
  '..',
  '..',
  'packages',
  'shared',
  'generated-zod',
  'inputTypeSchemas'
);

// Boşaltılacak bozuk dosyalar (.ts) ve index'ten kaldırılacak export adları.
const SCHEMAS = [
  'JsonNullValueFilterSchema',
  'JsonNullValueInputSchema',
  'NullableJsonNullValueInputSchema',
];

let blanked = 0;
for (const name of SCHEMAS) {
  const file = join(INPUT_TYPES_DIR, `${name}.ts`);
  const current = readFileSync(file, 'utf8');
  if (current !== '') {
    writeFileSync(file, '');
    blanked++;
  }
}

const indexPath = join(INPUT_TYPES_DIR, 'index.ts');
const lines = readFileSync(indexPath, 'utf8').split('\n');
const kept = lines.filter(
  (line) => !SCHEMAS.some((name) => line.includes(`export { ${name} }`))
);
const removed = lines.length - kept.length;
if (removed > 0) {
  writeFileSync(indexPath, kept.join('\n'));
}

console.log(
  `[clean-generated-zod] ${blanked} bozuk şema boşaltıldı, ${removed} index export'u kaldırıldı.`
);
