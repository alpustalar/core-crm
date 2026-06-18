import {
  Appointment,
  Clinic,
  Patient,
  Provider,
  Treatment,
  User,
} from '@shared';

export type AppointmentWithDetails = Appointment & {
  patient: Patient | null;
  provider: (Provider & { user: User }) | null;
  treatment: Treatment | null;
  clinic: Clinic | null;
};
