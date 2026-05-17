import { LogSource } from '@src/domain/constants/log-action.constant';
import { Clinic, Organization, Role } from '@shared';

export type OwnedOrganization = Pick<Organization, 'id'>;
export type ManagedClinics = Pick<Clinic, 'id'>;

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
