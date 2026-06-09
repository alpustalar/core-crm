export type FindConflictingAppointmentProps = {
  providerId: string;
  startTime: Date;
  endTime: Date;
  ignoreAppointmentId?: string;
};

export type CheckConflictProps = {
  providerId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  ignoreAppointmentId?: string;
};
