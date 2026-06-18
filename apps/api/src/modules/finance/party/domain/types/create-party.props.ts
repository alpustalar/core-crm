import { PartyOriginTypeType as PartyOriginType } from '@input-type-schemas/PartyOriginTypeSchema';
import { PartyTypeType as PartyType } from '@input-type-schemas/PartyTypeSchema';
import { PartyRoleType as PartyRole } from '@input-type-schemas/PartyRoleSchema';

export interface CreatePartyProps {
  id?: string;
  clinicId: string;
  organizationId: string;
  type: PartyType;
  roles: PartyRole[];
  name: string;
  taxNumber?: string | null;
  nationalId?: string | null;
  taxOffice?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isEInvoiceUser?: boolean;
  eInvoiceMailbox?: string | null;
  receivableAccountId?: string | null;
  payableAccountId?: string | null;
  originType: PartyOriginType;
  originId?: string | null;
  isActive?: boolean;
}
