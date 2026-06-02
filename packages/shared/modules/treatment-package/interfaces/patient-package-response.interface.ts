export interface PatientPackageResponse {
  id: string;
  patientId: string;
  packageId: string;
  packageName: string;
  providerId: string;
  providerName?: string;
  paymentId?: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'SUSPENDED';
  usedExaminationCount: number;
  usedControlCount: number;
  examinationCount: number;
  controlCount: number;
  createdAt: Date;
}
