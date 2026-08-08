const { writeFileSync, readFileSync, readdirSync } = require('fs');
const { join } = require('path');

const GENERATED_DIR = join(
  __dirname,
  '..',
  '..',
  '..',
  'packages',
  'shared',
  'generated-zod'
);
const INPUT_TYPES_DIR = join(GENERATED_DIR, 'inputTypeSchemas');
const MODEL_SCHEMA_DIR = join(GENERATED_DIR, 'modelSchema');

// ─────────────────────────────────────────────────────────────────────────────
// 1) Bozuk şemaları boşalt
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// 2) `@prisma/client` bağımlılığını sök
// ─────────────────────────────────────────────────────────────────────────────
//
// NEDEN: Üretilmiş Prisma client'ı npm paketinde değil `apps/api/generated/prisma`
// içinde yaşıyor. `packages/shared` ondan tip çektiği sürece paketi tüketen her şey
// (packages/nest-kernel, ileride apps/messaging) `apps/api`'nin içine uzanmak zorunda
// kalır — yani hiçbir paket app'lerden bağımsız derlenemez. Prisma şeması yerinde
// kalır; yalnız üretilen zod çıktısı kendi tiplerini kullanır.
//
// Prisma'nın buradaki tüm kullanımı tiptir; tek runtime kullanımı
// `z.instanceof(Prisma.Decimal, …)` idi ve o da sınıf kimliğine bağlı olduğu için
// zaten hatalıydı (bkz. decimal.contract.ts).

const listTs = (dir) => readdirSync(dir).filter((f) => f.endsWith('.ts'));

let decimalRewritten = 0;

for (const file of listTs(MODEL_SCHEMA_DIR)) {
  const path = join(MODEL_SCHEMA_DIR, file);
  const src = readFileSync(path, 'utf8');
  if (!src.includes('@prisma/client')) continue;

  // z.instanceof(Prisma.Decimal, { message: "…" })  →  decimalSchema("…")
  let next = src.replace(
    /z\.instanceof\(Prisma\.Decimal,\s*\{\s*message:\s*("(?:[^"\\]|\\.)*")\s*\}\)/g,
    'decimalSchema($1)'
  );

  // Prisma import'unu decimalSchema import'uyla değiştir.
  next = next.replace(
    /^import \{ Prisma \} from '@prisma\/client';?\n/m,
    "import { decimalSchema } from '../../common/decimal';\n"
  );

  if (next !== src) {
    writeFileSync(path, next);
    decimalRewritten++;
  }
}

// Prisma tipine bağlı 4 inputTypeSchema — hepsinde kullanım salt tiptir.
const INPUT_TYPE_REWRITES = {
  'DecimalJsLikeSchema.ts': [
    [
      /^import type \{ Prisma \} from '@prisma\/client';?\n/m,
      "import type { DecimalJsLike } from '../../common/decimal';\n",
    ],
    [/z\.ZodType<Prisma\.DecimalJsLike>/g, 'z.ZodType<DecimalJsLike>'],
  ],
  'isValidDecimalInput.ts': [
    [
      /^import type \{ Prisma \} from '@prisma\/client';?\n/m,
      "import type { DecimalJsLike } from '../../common/decimal';\n",
    ],
    [/Prisma\.DecimalJsLike/g, 'DecimalJsLike'],
  ],
  'JsonValueSchema.ts': [
    [/^import type \{ Prisma \} from '@prisma\/client';?\n/m, ''],
    [
      /z\.ZodType<Prisma\.JsonValue>/g,
      // Şemanın kendisi şekli zaten tanımlıyor; Prisma'nın tipine gerek yok.
      'z.ZodType<JsonValueType>',
    ],
    [
      /^export const JsonValueSchema/m,
      'export type JsonValueType =\n  | string\n  | number\n  | boolean\n  | null\n  | { [key: string]: JsonValueType | undefined }\n  | JsonValueType[];\n\nexport const JsonValueSchema',
    ],
    // Generator dosyanın sonunda tipi yeniden türetiyor; mükerrer tanımı kaldır.
    [/^export type JsonValueType = z\.infer<typeof JsonValueSchema>;\n/m, ''],
  ],
  'InputJsonValueSchema.ts': [
    [/^import \{ Prisma \} from '@prisma\/client';?\n/m, ''],
    [/z\.ZodType<Prisma\.InputJsonValue>/g, 'z.ZodType<InputJsonValueType>'],
    [
      /^export const InputJsonValueSchema/m,
      'export type InputJsonValueType =\n  | string\n  | number\n  | boolean\n  | { toJSON: () => unknown }\n  | { [key: string]: InputJsonValueType | null | undefined }\n  | Array<InputJsonValueType | null>;\n\nexport const InputJsonValueSchema',
    ],
    [
      /^export type InputJsonValueType = z\.infer<typeof InputJsonValueSchema>;\n/m,
      '',
    ],
  ],
};

let inputTypesRewritten = 0;
for (const [file, rewrites] of Object.entries(INPUT_TYPE_REWRITES)) {
  const path = join(INPUT_TYPES_DIR, file);
  const src = readFileSync(path, 'utf8');
  if (!src.includes('@prisma/client')) continue;

  let next = src;
  for (const [pattern, replacement] of rewrites) {
    next = next.replace(pattern, replacement);
  }
  if (next !== src) {
    writeFileSync(path, next);
    inputTypesRewritten++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3) Guard — iş yarım kaldıysa SESSİZ GEÇMEsin
// ─────────────────────────────────────────────────────────────────────────────
//
// Generator çıktısının şekli değişirse yukarıdaki regex'ler eşleşmez ve `@prisma/client`
// import'ları yerinde kalır. Bu, aylar sonra "messaging derlenmiyor" olarak geri döner.
// Burada hemen, ne yapılması gerektiğini söyleyerek patlar.

const leaks = [];
for (const dir of [MODEL_SCHEMA_DIR, INPUT_TYPES_DIR]) {
  for (const file of listTs(dir)) {
    if (readFileSync(join(dir, file), 'utf8').includes('@prisma/client')) {
      leaks.push(join(dir === MODEL_SCHEMA_DIR ? 'modelSchema' : 'inputTypeSchemas', file));
    }
  }
}

if (leaks.length > 0) {
  console.error(
    `\n[clean-generated-zod] HATA: ${leaks.length} üretilmiş dosyada '@prisma/client' import'u kaldı:\n` +
      leaks.map((f) => `  - ${f}`).join('\n') +
      `\n\npackages/shared '@prisma/client'a bağlanamaz: üretilmiş client npm paketinde değil\n` +
      `apps/api/generated/prisma içinde, dolayısıyla paketler app'lerden bağımsız derlenemez.\n` +
      `zod-prisma-types çıktısının şekli değişmiş olabilir — bu script'teki dönüşümleri\n` +
      `(scripts/clean-generated-zod.cjs, bölüm 2) yeni çıktıya göre güncelleyin.\n`
  );
  process.exit(1);
}

console.log(
  `[clean-generated-zod] ${blanked} bozuk şema boşaltıldı, ${removed} index export'u kaldırıldı, ` +
    `${decimalRewritten} model şeması + ${inputTypesRewritten} input şeması Prisma'dan koparıldı.`
);
