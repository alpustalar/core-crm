import { Role } from '@shared/generated-zod';
import { IProviderResponse } from '../../provider';
import { GlobalStatusType } from '@shared/generated-zod/inputTypeSchemas/GlobalStatusSchema';

export interface RelationalDto {
  id: string;
  name: string;
}

export interface UserResponse {
  id: string;
  displayName: string;
  picture?: string;
  clinicId?: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  lastLogin: Date;
  status: GlobalStatusType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  managedClinics?: RelationalDto[];
  ownedOrganizations?: RelationalDto[];
  providerProfileId?: string | null;
  doctorProfile?: IProviderResponse;
}
