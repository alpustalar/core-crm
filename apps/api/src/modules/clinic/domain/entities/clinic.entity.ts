import { Clinic } from '@shared';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';
import { ClinicOperationMode, GlobalStatus } from '@prisma/client';

export class ClinicEntity implements Clinic {
  id: string;
  status: GlobalStatusType;
  name: string;
  slug: string;
  sectorId: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  timezone: string;
  logo: string | null;
  operationMode: ClinicOperationMode;
  consultationSlotDuration: number;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }
  get isActive(): boolean {
    return this.status === GlobalStatus.ACTIVE && !this.isDeleted;
  }

  public canAcceptAppointments(): boolean {
    return this.isActive;
  }
}
