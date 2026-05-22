import { CreateClinic } from '@shared';

export type CreateClinicProps = CreateClinic & {
  organizationId?: string;
  id?: string;
};
