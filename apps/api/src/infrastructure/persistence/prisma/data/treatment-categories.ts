import {
  DENTAL_TREATMENT_CATEGORY,
  LANGUAGE_CODES,
} from '@common/constants/db';
import {
  dentalTreatmentCategorySlugs,
  sectorSlugs,
} from '@src/infrastructure/persistence/prisma/data/constants';
import { SectorType } from '@prisma/client';

export const DENTAL_TREATMENT_CATEGORIES = {
  DIAGNOSIS: {
    slug: dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.DIAGNOSIS],
    [LANGUAGE_CODES.TR]: 'Teşhis ve Planlama',
    [LANGUAGE_CODES.EN]: 'Diagnosis and Planning',
  },
  RESTORATIVE: {
    slug: dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.RESTORATIVE],
    [LANGUAGE_CODES.TR]: 'Tedavi ve Endodonti',
    [LANGUAGE_CODES.EN]: 'Restorative and Endodontics',
  },
  SURGERY: {
    slug: dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.SURGERY],
    [LANGUAGE_CODES.TR]: 'Cerrahi',
    [LANGUAGE_CODES.EN]: 'Surgery',
  },
  PEDODONTICS: {
    slug: dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.PEDODONTICS],
    [LANGUAGE_CODES.TR]: 'Çocuk Diş Hekimliği',
    [LANGUAGE_CODES.EN]: 'Pedodontics',
  },
  PERIODONTOLOGY: {
    slug: dentalTreatmentCategorySlugs[
      DENTAL_TREATMENT_CATEGORY.PERIODONTOLOGY
    ],
    [LANGUAGE_CODES.TR]: 'Diş Eti Tedavileri',
    [LANGUAGE_CODES.EN]: 'Periodontology',
  },
  PROSTHODONTICS: {
    slug: dentalTreatmentCategorySlugs[
      DENTAL_TREATMENT_CATEGORY.PROSTHODONTICS
    ],
    [LANGUAGE_CODES.TR]: 'Protez ve Kaplamalar',
    [LANGUAGE_CODES.EN]: 'Prosthodontics',
  },
  ORTHODONTICS: {
    slug: dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.ORTHODONTICS],
    [LANGUAGE_CODES.TR]: 'Tel Tedavisi',
    [LANGUAGE_CODES.EN]: 'Orthodontics',
  },
  COSMETIC: {
    slug: dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.COSMETIC],
    [LANGUAGE_CODES.TR]: 'Estetik',
    [LANGUAGE_CODES.EN]: 'Cosmetic',
  },
  OTHER: {
    slug: dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.OTHER],
    [LANGUAGE_CODES.TR]: 'Diğer',
    [LANGUAGE_CODES.EN]: 'Other',
  },
  sectorSlug: sectorSlugs[SectorType.DENTAL],
};

export const treatmentCategories = [DENTAL_TREATMENT_CATEGORIES];
