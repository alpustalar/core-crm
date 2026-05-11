export interface InitializeIyzicoInput {
  paymentId: string;
  amount: number;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  appointmentId?: string;
  treatmentName?: string;
  clinicCity?: string;
  clinicAddress?: string;
  callbackIp: string;
}
