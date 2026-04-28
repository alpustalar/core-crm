import { SectorType } from '@prisma/client';
import { slugIt } from '@common/utils';

export const sectorSlugs = {
  [SectorType.DENTAL]: slugIt(SectorType.DENTAL),
  [SectorType.ALL]: slugIt(SectorType.ALL),
} as const;

export type SectorSlug = (typeof sectorSlugs)[keyof typeof sectorSlugs];
