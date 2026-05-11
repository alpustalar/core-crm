import { LanguageCode } from '@src/domain/constants/db';
import { dentalMasterTreatments } from '@src/infrastructure/persistence/prisma/data/modules/master-treatments/dental-treatments/dental-treatments';

export type MasterTreatmentsCreateManyInputs = {
  defaultDuration: number;
  slug: string;
  treatmentCategorySlug: string;
  sectorSlug: string;
  translations: {
    name: Partial<Record<LanguageCode, string>>;
    description: Partial<Record<LanguageCode, string>>;
  };
};
export const masterTreatmentsCreateManyInputs: MasterTreatmentsCreateManyInputs[] =
  [...dentalMasterTreatments];
