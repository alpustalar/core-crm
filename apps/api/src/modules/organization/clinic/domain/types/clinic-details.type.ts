import { Clinic, Organization } from '@shared';

export type ClinicDetails = Clinic & {
  organization: Organization | null;
  managers: {
    id: string;
    displayName: string;
    email: string;
  }[];
  _count: {
    providers: number;
    patients: number;
    appointments: number;
  };
};
