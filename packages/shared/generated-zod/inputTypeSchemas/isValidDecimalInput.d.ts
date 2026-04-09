import type { Prisma } from '@prisma/client';
export declare const DECIMAL_STRING_REGEX: RegExp;
export declare const isValidDecimalInput: (v?: null | string | number | Prisma.DecimalJsLike) => v is string | number | Prisma.DecimalJsLike;
export default isValidDecimalInput;
