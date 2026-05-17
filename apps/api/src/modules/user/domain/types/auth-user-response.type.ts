import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';
import { RoleWithCapabilities } from '@common/interfaces';

export type AuthUserResponse = {
  id: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  status: GlobalStatusType;
  roleId: string | null;
  picture: string | null;
  clinicId: string | null;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  managedClinics: Array<{ id: string }>;
  ownedOrganizations: Array<{ id: string }>;
  providerProfile: { id: string } | null;
  role: RoleWithCapabilities | null;
};
