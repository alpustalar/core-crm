export const LANGUAGE_CODES = {
  TR: 'TR',
  EN: 'EN',
} as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[keyof typeof LANGUAGE_CODES];
