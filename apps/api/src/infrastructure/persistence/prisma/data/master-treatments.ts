import { SectorType } from '@prisma/client';
import { slugIt } from '@common/utils';
import { dentalTreatmentCategorySlugs } from '@src/infrastructure/persistence/prisma/data/constants';
import {
  DENTAL_TREATMENT_CATEGORY,
  LANGUAGE_CODES,
} from '@common/constants/db';

type MasterTreatmentsCreateManyInputs = {
  defaultDuration: number;
  slug: string;
  treatmentCategorySlug: string;
  sectorSlug: string;
};

const dentistryMasterTreatments: MasterTreatmentsCreateManyInputs[] = [
  {
    slug: slugIt('Diş Hekimi Muayenesi'),
    defaultDuration: 20,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.DIAGNOSIS],
  },
  {
    slug: slugIt('Uzman Diş Hekimi Muayenesi'),
    defaultDuration: 20,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.DIAGNOSIS],
  },
  {
    slug: slugIt('Panoramik Röntgen Filmi'),
    defaultDuration: 15,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.DIAGNOSIS],
  },

  // --- RESTORATIVE (Tedavi ve Endodonti) ---
  {
    slug: slugIt('Kompozit Dolgu (Tek Yüzlü)'),
    defaultDuration: 40,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.RESTORATIVE],
  },
  {
    slug: slugIt('Kompozit Dolgu (İki Yüzlü)'),
    defaultDuration: 50,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.RESTORATIVE],
  },
  {
    slug: slugIt('Kanal Tedavisi (Tek Kanal - Dolgu Hariç)'),
    defaultDuration: 60,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.RESTORATIVE],
  },
  {
    slug: slugIt('Kanal Tedavisi (İki Kanal - Dolgu Hariç)'),
    defaultDuration: 90,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.RESTORATIVE],
  },

  // --- SURGERY (Cerrahi) ---
  {
    slug: slugIt('Diş Çekimi'),
    defaultDuration: 30,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.SURGERY],
  },
  {
    slug: slugIt('Komplikasyonlu Diş Çekimi'),
    defaultDuration: 45,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.SURGERY],
  },
  {
    slug: slugIt('Gömülü Diş Operasyonu'),
    defaultDuration: 60,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.SURGERY],
  },
  {
    slug: slugIt('İmplant Uygulaması (Tek Ünite)'),
    defaultDuration: 45,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.SURGERY],
  },

  // --- PERIODONTOLOGY (Diş Eti) ---
  {
    slug: slugIt('Detertraj (Diş Taşı Temizliği - Tek Çene)'),
    defaultDuration: 30,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.PERIODONTOLOGY],
  },
  {
    slug: slugIt('Subgingival Küretaj (Diş Eti Tedavisi)'),
    defaultDuration: 45,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.PERIODONTOLOGY],
  },

  // --- PROSTHODONTICS (Protez ve Kaplamalar) ---
  {
    slug: slugIt('Zirkonyum Kaplama (Tek Ünite)'),
    defaultDuration: 45,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.PROSTHODONTICS],
  },
  {
    slug: slugIt('Porselen Kaplama (Metal Destekli)'),
    defaultDuration: 45,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.PROSTHODONTICS],
  },
  {
    slug: slugIt('Tam Protez (Tek Çene)'),
    defaultDuration: 60,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.PROSTHODONTICS],
  },

  // --- COSMETIC (Estetik) ---
  {
    slug: slugIt('Diş Beyazlatma (Ofis Tipi)'),
    defaultDuration: 60,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.COSMETIC],
  },
  {
    slug: slugIt('Lamina Veneer (Porselen)'),
    defaultDuration: 60,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.COSMETIC],
  },

  // --- PEDODONTICS (Çocuk) ---
  {
    slug: slugIt('Fissür Örtücü (Tek Diş)'),
    defaultDuration: 20,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.PEDODONTICS],
    translations: {
      [LANGUAGE_CODES.TR]: '',
      [LANGUAGE_CODES.EN]: '',
    },
  },
  {
    slug: slugIt('Yer Tutucu (Sabit)'),
    defaultDuration: 40,
    treatmentCategorySlug:
      dentalTreatmentCategorySlugs[DENTAL_TREATMENT_CATEGORY.PEDODONTICS],
  },
].map((treatment) => ({
  ...treatment,
  sectorSlug: slugIt(SectorType.DENTAL),
}));

export const masterTreatmentsCreateManyInputs: MasterTreatmentsCreateManyInputs[] =
  [...dentistryMasterTreatments];
