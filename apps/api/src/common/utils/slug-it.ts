import slugify from 'slugify';

export const slugIt = (text: string) => {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'tr',
  });
};
