import { PartyRole } from '@prisma/client';

export interface FindPartiesFilter {
  organizationId: string;
  role?: PartyRole;
  isActive?: boolean;
}
