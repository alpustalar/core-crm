import { PartyRoleType } from '@input-type-schemas/PartyRoleSchema';

export interface FindPartiesFilter {
  organizationId: string;
  role?: PartyRoleType;
  isActive?: boolean;
}
