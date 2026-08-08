import { z } from 'zod';
import { Decimal } from 'decimal.js';

/**
 * decimal.js'in yapısal şekli — Prisma'nın `Prisma.DecimalJsLike`'ının Prisma'sız
 * karşılığı. Üretilen zod şemaları bu tipi kullanır, böylece `packages/shared`
 * `@prisma/client`'a bağlanmaz.
 */
export interface DecimalJsLike {
  d: number[];
  e: number;
  s: number;
  toFixed(): string;
}

/**
 * Bir değerin ondalık sayı nesnesi olup olmadığını **yapısal** olarak sınar.
 *
 * Neden `instanceof` değil: Prisma decimal.js'i kendi runtime'ına gömüyor, bu yüzden
 * `Prisma.Decimal` ile `decimal.js`'in `Decimal`'i **farklı sınıflardır** — bir taraftan
 * gelen değer diğerinin `instanceof` kontrolünü geçmez (doğrulandı: her iki yön de
 * `false`). Sınıf kimliğine bakan bir kontrol, değerin nereden geldiğine göre sessizce
 * ret verirdi. Yapısal kontrol ikisini de kabul eder.
 */
export const isDecimalLike = (value: unknown): boolean => {
  if (value instanceof Decimal) return true;
  return (
    typeof value === 'object' &&
    value !== null &&
    'd' in value &&
    'e' in value &&
    's' in value &&
    'toFixed' in value
  );
};

/**
 * Üretilen model şemalarındaki `z.instanceof(Prisma.Decimal, { message })` çağrılarının
 * yerini alır. Mesajı parametre alır ki generator'ın ürettiği alan/model bilgisi
 * (`"Field 'budget' must be a Decimal. Location: ..."`) kaybolmasın.
 */
export const decimalSchema = (message: string) =>
  z.custom<Decimal>(isDecimalLike, { message });
