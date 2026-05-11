import { AppointmentEvent } from '@src/domain/constants/events/appointment.constant';
import { ClinicEvent } from '@src/domain/constants/events/clinic.constants';
import { UserEvent } from '@src/domain/constants/events/user.constant';
import { OrganizationEvent } from '@src/domain/constants/events/organization.constant';
import { PaymentEvent } from '@src/domain/constants/events/payment.constants';
import { ProviderEvent } from '@src/domain/constants/events/provider.constant';
import { PatientEvent } from '@src/domain/constants/events/patient.constant';
import { ThrottleEvent } from '@src/domain/constants/events/throttle.constant';
import { TreatmentEvent } from '@src/domain/constants/events/treatment.constant';

export type AppEventName =
  | AppointmentEvent
  | ClinicEvent
  | ProviderEvent
  | OrganizationEvent
  | PatientEvent
  | PaymentEvent
  | ThrottleEvent
  | TreatmentEvent
  | UserEvent;

export * from './appointment.constant';
export * from './clinic.constants';
export * from './provider.constant';
export * from './organization.constant';
export * from './patient.constant';
export * from './payment.constants';
export * from './throttle.constant';
export * from './treatment.constant';
export * from './user.constant';
