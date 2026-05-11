import { slugIt } from '@common/utils';
import { MasterTreatmentsCreateManyInputs } from '@src/infrastructure/persistence/prisma/data/modules/master-treatments/master-treatments';
import { sectorSlugs } from '@src/infrastructure/persistence/prisma/data/modules/sectors';
import { cosmetic } from '@src/infrastructure/persistence/prisma/data/modules/master-treatments/dental-treatments/cosmetic';
import { diagnosis } from '@src/infrastructure/persistence/prisma/data/modules/master-treatments/dental-treatments/diagnosis';
import { orthodontics } from '@src/infrastructure/persistence/prisma/data/modules/master-treatments/dental-treatments/orthodontics';
import { pedodontics } from '@src/infrastructure/persistence/prisma/data/modules/master-treatments/dental-treatments/pedodontics';
import { periodontology } from '@src/infrastructure/persistence/prisma/data/modules/master-treatments/dental-treatments/periodontology';
import { prosthodontics } from '@src/infrastructure/persistence/prisma/data/modules/master-treatments/dental-treatments/prosthodontics';
import { restorative } from '@src/infrastructure/persistence/prisma/data/modules/master-treatments/dental-treatments/restorative';
import { other } from '@src/infrastructure/persistence/prisma/data/modules/master-treatments/dental-treatments/other';
import { surgery } from '@src/infrastructure/persistence/prisma/data/modules/master-treatments/dental-treatments/surgery';
export { dentalTreatmentSlugs } from '@src/infrastructure/persistence/prisma/data/modules/master-treatments/dental-treatments/dental-treatment-slugs';

export const dentalMasterTreatments: MasterTreatmentsCreateManyInputs[] = [
  ...cosmetic,
  ...diagnosis,
  ...orthodontics,
  ...other,
  ...pedodontics,
  ...periodontology,
  ...prosthodontics,
  ...restorative,
  ...surgery,
].map((treatment) => ({
  ...treatment,
  sectorSlug: slugIt(sectorSlugs.DENTAL),
}));
