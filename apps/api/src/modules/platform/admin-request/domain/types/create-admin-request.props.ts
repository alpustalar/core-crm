import { AdminRequestTypeType as AdminRequestType } from '@input-type-schemas/AdminRequestTypeSchema';

export interface CreateAdminRequestProps {
  id: string;
  type: AdminRequestType;
  targetId: string;
  requestedBy: string;
  organizationId?: string;
  metadata?: Record<string, any> | null;
}
