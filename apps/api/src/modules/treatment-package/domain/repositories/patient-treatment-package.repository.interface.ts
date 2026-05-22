import { PatientTreatmentPackage } from '@prisma/client';
import { Pagination } from '@shared';
import { AssignPackageToPatientProps } from '@modules/treatment-package/domain/types/assign-package-to-patient.props';

export const PATIENT_TREATMENT_PACKAGE_COMMAND_REPO = Symbol(
  'IPatientTreatmentPackageCommandRepository'
);
export const PATIENT_TREATMENT_PACKAGE_QUERY_REPO = Symbol(
  'IPatientTreatmentPackageQueryRepository'
);

export interface CreatePatientPackageWithPaymentInput
  extends AssignPackageToPatientProps {
  clinicId: string;
  price: number;
}

export interface IPatientTreatmentPackageCommandRepository {
  createWithPayment(
    input: CreatePatientPackageWithPaymentInput
  ): Promise<PatientTreatmentPackage>;
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
