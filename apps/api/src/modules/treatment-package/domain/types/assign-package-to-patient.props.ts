export interface AssignPackageToPatientProps {
  patientId: string;
  packageId: string;
  providerId: string;
  clinicId: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  paymentId?: string;
}
