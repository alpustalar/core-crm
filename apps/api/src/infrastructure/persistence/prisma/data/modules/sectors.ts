import { Prisma } from '@prisma/client';
import { slugIt } from '@common/utils';

export const sectorSlugs = {
  DENTAL: slugIt('DENTAL'),
  ALL: slugIt('ALL'),
  HAIR_TRANSPLANT: slugIt('HAIR_TRANSPLANT'),
} as const;

export type SectorSlug = (typeof sectorSlugs)[keyof typeof sectorSlugs];

export const sectorCreateInputs: Prisma.SectorCreateInput[] = [
  {
    name: 'DENTAL',
    slug: sectorSlugs['DENTAL'],
  },
];
