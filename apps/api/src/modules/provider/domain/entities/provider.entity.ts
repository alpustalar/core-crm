import { Appointment, Provider as PrismaProvider, User } from '@prisma/client';
import {
  Clinic,
  MedicalFile,
  ProviderAvailability,
  ProviderException,
  ProviderShift,
  ProviderSpecialty,
  ProviderTitle,
  ProviderTreatment,
  Sector,
} from '@shared';

export class Provider implements PrismaProvider {
  readonly id: string;
  providerTitleId: string | null;
  providerSpecialtyId: string | null;
  publicPhone: string | null;
  publicEmail: string | null;
  isActive: boolean;
  canAcceptExamination: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  deletedAt: Date;
  clinicId: string;
  userId: string;
  sectorId: string | null;

  // Relations
  title?: ProviderTitle;
  specialty?: ProviderSpecialty;
  clinic?: Clinic;
  user?: User;
  appointments?: Appointment[];
  treatments?: ProviderTreatment[];
  providerAvailabilities?: ProviderAvailability[];
  medicalFiles?: MedicalFile[];
  sector?: Sector;
  providerExceptions?: ProviderException[];
  providerShifts?: ProviderShift[];

  constructor(props: Provider) {
    this.id = props.id;
    this.providerTitleId = props.providerTitleId;
    this.providerSpecialtyId = props.providerSpecialtyId;
    this.publicPhone = props.publicPhone;
    this.publicEmail = props.publicEmail;
    this.isActive = props.isActive;
    this.canAcceptExamination = props.canAcceptExamination;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
    this.clinicId = props.clinicId;
    this.userId = props.userId;
    this.sectorId = props.sectorId;

    // Relation assignments
    this.title = props.title;
    this.specialty = props.specialty;
    this.clinic = props.clinic;
    this.user = props.user;
    this.appointments = props.appointments;
    this.treatments = props.treatments;
    this.providerAvailabilities = props.providerAvailabilities;
    this.medicalFiles = props.medicalFiles;
    this.sector = props.sector;
    this.providerExceptions = props.providerExceptions;
    this.providerShifts = props.providerShifts;
  }

  get isDeleted(): boolean {
    return !!this.deletedAt;
  }

  canWorkAt(date: Date): boolean {
    if (!this.isActive || this.isDeleted) return false;
    // TODO: shift ve exception kontrolleri yap
    return true;
  }
}
