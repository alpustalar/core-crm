export type RescheduleAppointmentProps = {
  startTime: Date;
  endTime: Date;
  providerId: string;
  notes?: string;
  treatmentId?: string;
};
