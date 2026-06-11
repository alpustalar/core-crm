/**
 * `prisma generate` sonrası çalışan temizlik adımı.
 *
 * zod-prisma-types, `createInputTypes = false` olmasına rağmen Json alanları
 * yüzünden şu 3 "JSON null" yardımcı şemasını `Prisma` import'u OLMADAN üretir
 * ve bunları barrel index'ine ekler. Sonuç: `Cannot find namespace 'Prisma'`
 * derleme hataları. Bu şemalar input-type'lar kapalı olduğu için kullanılmıyor
 * (yalnızca index re-export ediyor) — bu yüzden boşaltıp index export'larını
 * kaldırıyoruz. Idempotent: tekrar çalıştırmak güvenlidir.
 */
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
