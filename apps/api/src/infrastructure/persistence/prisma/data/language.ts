import { Prisma } from '@prisma/client';
import { LANGUAGE_CODES } from '@common/constants/db';

const { TR, EN } = LANGUAGE_CODES;
export const languageCreateManyInputs: Prisma.LanguageCreateInput[] = [
  {
    name: 'Türkçe',
    code: TR,
  },
  {
    name: 'English',
    code: EN,
  },
];
