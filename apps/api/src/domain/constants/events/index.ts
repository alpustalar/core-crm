import { AppointmentEvent } from '@src/domain/constants/events/appointment.constant';
import { ClinicEvent } from '@src/domain/constants/events/clinic.constants';
import { UserEvent } from '@src/domain/constants/events/user.constant';
import { OrganizationEvent } from '@src/domain/constants/events/organization.constant';
import { PaymentEvent } from '@src/domain/constants/events/payment.constants';
import { ProviderEvent } from '@src/domain/constants/events/provider.constant';
import { PatientEvent } from '@src/domain/constants/events/patient.constant';
import { ThrottleEvent } from '@src/domain/constants/events/throttle.constant';
import { TreatmentEvent } from '@src/domain/constants/events/treatment.constant';
import { TreatmentPackageEvent } from '@src/domain/constants/events/treatment-package.constant';
import { SubscriptionEvent } from '@src/domain/constants/events/subscription.constant';
import { InvoiceEvent } from '@src/domain/constants/events/invoice.constants';
import { PosEvent } from '@src/domain/constants/events/pos.constants';
import { MetaAdsEvent } from '@src/domain/constants/events/meta-ads.constants';
import { LeadEvent } from '@src/domain/constants/events/lead.constant';
import { InventoryEvent } from '@src/domain/constants/events/inventory.constant';
import { AdminRequestEvent } from '@src/domain/constants/events/admin-request.constants';
import { SecurityEvent } from '@src/domain/constants/events/security.constants';
import { FinanceLedgerEvent } from '@src/domain/constants/events/finance-ledger.constants';
import { FinancialEventEvent } from '@src/domain/constants/events/financial-event.constants';
import { GovernanceEvent } from '@src/domain/constants/events/governance.constants';
import { MessagingEvent } from '@src/domain/constants/events/messaging.constants';

export type AppEventName =
  | AppointmentEvent
  | ClinicEvent
  | ProviderEvent
  | OrganizationEvent
  | PatientEvent
  | PaymentEvent
  | ThrottleEvent
  | TreatmentEvent
  | TreatmentPackageEvent
  | UserEvent
  | SubscriptionEvent
  | InvoiceEvent
  | PosEvent
  | MetaAdsEvent
  | LeadEvent
  | InventoryEvent
  | AdminRequestEvent
  | SecurityEvent
  | FinanceLedgerEvent
  | FinancialEventEvent
  | GovernanceEvent
  | MessagingEvent;

export * from './appointment.constant';
export * from './clinic.constants';
export * from './provider.constant';
export * from './organization.constant';
export * from './patient.constant';
export * from './payment.constants';
export * from './throttle.constant';
export * from './treatment.constant';
export * from './treatment-package.constant';
export * from './user.constant';
export * from './subscription.constant';
export * from './invoice.constants';
export * from './pos.constants';
export * from './meta-ads.constants';
export * from './lead.constant';
export * from './inventory.constant';
export * from './admin-request.constants';
export * from './security.constants';
export * from './finance-ledger.constants';
export * from './financial-event.constants';
export * from './governance.constants';
export * from './messaging.constants';
