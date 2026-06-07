import { Pagination } from '@shared';
import { AppointmentStatusType } from '@input-type-schemas/AppointmentStatusSchema';

export type FindByOrganizationIdProps = {
  organizationId: string;
  pagination: Pagination;
  clinicId?: string;
  status?: AppointmentStatusType;
  startDate?: Date;
  endDate?: Date;
};
