import { Prisma, SectorType } from '@prisma/client';
import { sectorSlugs } from '@src/infrastructure/persistence/prisma/data/constants';

export const sectorCreateInputs: Prisma.SectorCreateInput[] = [
  {
    name: SectorType.DENTAL,
    slug: sectorSlugs[SectorType.DENTAL],
  },
];
