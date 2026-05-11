import { DENTAL_TREATMENT } from '@src/domain/constants/db/master-treatments';
import { enumToSlug } from '@src/infrastructure/persistence/prisma/data/utils';

export const dentalTreatmentSlugs = enumToSlug(DENTAL_TREATMENT);
