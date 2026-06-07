import { AdminRequestType, Prisma } from '@prisma/client';

export interface CreateAdminRequestProps {
  id: string;
  type: AdminRequestType;
  targetId: string;
  requestedBy: string;
  organizationId?: string;
  metadata?: Prisma.InputJsonValue;
}
