import { GlobalStatus } from '@prisma/client';

export type UserSummary = {
  id: string;
  displayName: string;
  email: string;
  picture: string | null;
  status: GlobalStatus;
  lastLogin: Date;
  createdAt: Date;
  role: { id: string; name: string } | null;
  workingClinic: { id: string; name: string } | null;
  providerProfile: { id: string } | null;
  managedClinics: Array<{ id: string; name: string }>;
};
