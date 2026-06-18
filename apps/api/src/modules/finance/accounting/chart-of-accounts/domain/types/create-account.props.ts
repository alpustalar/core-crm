import { AccountSideType } from '@input-type-schemas/AccountSideSchema';
import { AccountTypeType as AccountType } from '@input-type-schemas/AccountTypeSchema';

export interface CreateAccountProps {
  id?: string;
  clinicId: string;
  organizationId: string;
  code: string;
  name: string;
  parentId?: string | null;
  type: AccountType;
  normalSide: AccountSideType;
  isPostable?: boolean;
  requiresParty?: boolean;
  currency?: string | null;
  isActive?: boolean;
}
