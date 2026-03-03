import { Organization, Role } from '@prisma/client';

export type OwnedOrganization = Pick<Organization, 'id' | 'name'>;
export type ManagedClinics = Pick<Organization, 'id' | 'name'>;

export type ActorContext = {
  userId: string;
  roleId?: string;
  role?: Role;
  email: string;
  capabilities?: string[]; // ['user:create', 'patient:read']
  rolePriority?: number;
  clinicId?: string;
  managedClinics?: ManagedClinics[];
  ownedOrganizations?: OwnedOrganization[];
};
