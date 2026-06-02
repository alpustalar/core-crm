import { PatientTreatmentPackage } from '@prisma/client';
import { Pagination } from '@shared';

export const PATIENT_TREATMENT_PACKAGE_COMMAND_REPO = Symbol(
  'IPatientTreatmentPackageCommandRepository'
);
export const PATIENT_TREATMENT_PACKAGE_QUERY_REPO = Symbol(
  'IPatientTreatmentPackageQueryRepository'
);

export interface CreatePatientPackageInput {
  patientId: string;
  packageId: string;
  providerId: string;
  clinicId: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  paymentId: string;
}

export interface IPatientTreatmentPackageCommandRepository {
  create(input: CreatePatientPackageInput): Promise<PatientTreatmentPackage>;
  update(
    id: string,
    data: Partial<{
      notes: string;
      status: string;
      providerId: string;
      usedExaminationCount: number;
      usedControlCount: number;
    }>
  ): Promise<PatientTreatmentPackage>;
}

export interface IPatientTreatmentPackageQueryRepository {
  findById(id: string): Promise<PatientTreatmentPackage | null>;
  findManyByPatient(
    patientId: string,
    pagination: Pagination,
    status?: string
  ): Promise<{ items: PatientTreatmentPackage[]; total: number }>;
}
