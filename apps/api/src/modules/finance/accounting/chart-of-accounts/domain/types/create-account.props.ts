import { AccountSide, AccountType } from '@prisma/client';

export interface CreateAccountProps {
  id?: string;
  clinicId: string;
  organizationId: string;
  code: string;
  name: string;
  parentId?: string | null;
  type: AccountType;
  normalSide: AccountSide;
  isPostable?: boolean;
  requiresParty?: boolean;
  currency?: string | null;
  isActive?: boolean;
}
