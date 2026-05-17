import {
  GlobalStatusSchema,
  GlobalStatusType,
} from '@input-type-schemas/GlobalStatusSchema';
import { ClinicOperationModeType } from '@input-type-schemas/ClinicOperationModeSchema';
import { Clinic as IClinic, Organization, Sector } from '@shared';

export class Clinic implements IClinic {
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
  operationMode: ClinicOperationModeType;
  consultationSlotDuration: number;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  sector: Sector | null;
  organization: Organization | null;

  get isDeleted(): boolean {
    return !!this.deletedAt;
  }

  get isActive(): boolean {
    return this.status === GlobalStatusSchema.enum.ACTIVE && !this.isDeleted;
  }

  public canAcceptAppointments(): boolean {
    return this.isActive;
  }
}
