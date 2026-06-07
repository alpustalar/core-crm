export type FindConflictingAppointmentProps = {
  providerId: string;
  startTime: Date;
  endTime: Date;
  ignoreAppointmentId?: string;
};
