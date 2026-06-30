import slugify from 'slugify';

export const slugIt = (text: string, locale: string = 'tr') => {
  return slugify(text, {
    lower: true,
    strict: true,
    locale,
  });
};
