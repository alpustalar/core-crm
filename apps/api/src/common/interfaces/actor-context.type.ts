import { Role } from '@shared';
import { LogSource } from '@src/domain/constants/log-action.constant';

export type OwnedOrganization = {
  id: string;
};
export type ManagedClinics = {
  id: string;
};

export type ActorContext = {
  userId: string;
  email: string;
  source: LogSource;
  capabilities: string[];
  rolePriority: number;
  managedClinics?: ManagedClinics[];
  ownedOrganizations?: OwnedOrganization[];
  roleId?: string;
  role?: Role;
  clinicId?: string;
  patientId?: string;
  organizationId?: string;
  ip?: string;
  providerId?: string;
};

export type PatientActorContext = {
  patientId: string;
  organizationId: string;
};
