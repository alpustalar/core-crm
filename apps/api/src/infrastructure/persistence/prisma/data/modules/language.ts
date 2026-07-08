import { LanguageDirection, Prisma } from '@prisma/client';
import { LANGUAGE_CODES } from '@src/domain/constants/db';

const { TR, EN, AR } = LANGUAGE_CODES;
export const languageCreateManyInputs: Prisma.LanguageCreateInput[] = [
  {
    name: 'Türkçe',
    code: TR,
  },
  {
    name: 'English',
    code: EN,
  },
  {
    name: 'اللغة العربية',
    code: AR,
    direction: LanguageDirection.RTL,
  },
].map((language) => ({
  ...language,
  id: crypto.randomUUID(),
}));
