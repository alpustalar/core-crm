import { Organization, Role } from '@prisma/client';
import { LogSource } from '@src/domain/constants/log-action.constant';

export type OwnedOrganization = Pick<Organization, 'id' | 'name'>;
export type ManagedClinics = Pick<Organization, 'id' | 'name'>;

export type ActorContext = {
  userId: string;
  roleId?: string;
  role?: Role;
  email: string;
  capabilities?: string[];
  rolePriority?: number;
  clinicId?: string;
  managedClinics?: ManagedClinics[];
  ownedOrganizations?: OwnedOrganization[];
  source?: LogSource;
  ip?: string;
};
