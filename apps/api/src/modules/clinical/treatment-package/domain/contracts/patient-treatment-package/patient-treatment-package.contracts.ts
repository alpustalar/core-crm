export interface CreatePatientTreatmentPackageProps {
  id?: string;
  patientId: string;
  packageId: string;
  providerId: string;
  startDate: Date;
  endDate: Date;
  paymentId?: string | null;
  notes?: string | null;
}

export interface UpdatePatientTreatmentPackageProps {
  providerId?: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string | null;
}
