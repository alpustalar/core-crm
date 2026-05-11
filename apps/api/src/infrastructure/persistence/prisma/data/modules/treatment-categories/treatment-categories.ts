import { DENTAL_TREATMENT_CATEGORIES } from '@src/infrastructure/persistence/prisma/data/modules/treatment-categories/dental-treatments';
import { TranslationHelper } from '@src/infrastructure/persistence/prisma/data/utils';
import { SectorSlug } from '@src/infrastructure/persistence/prisma/data/modules';

export type BaseCategoryItem<C extends string = string> = {
  slug: C;
  translations: {
    name: TranslationHelper;
    description: TranslationHelper;
  };
};

export type BaseTreatmentCategories<K extends string, C extends string> = {
  sectorSlug: SectorSlug;
  categories: Record<K, BaseCategoryItem<C>>;
};

export const treatmentCategories: BaseTreatmentCategories<string, string>[] = [
  DENTAL_TREATMENT_CATEGORIES,
];
